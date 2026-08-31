"""Behavioral-cloning training: your recorded sessions in, a .pt checkpoint and a
portable .onnx model out.

Run on your PC (CPU is fine):
    python -m rusty_pilot train
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from .config import Config
from .dataset import (
    BCFrameDataset,
    load_dataset_arrays,
    positive_weights,
    train_val_split,
)
from .export import export_onnx, verify_onnx
from .model import build_policy


def train(config: Config, out_name: str = "policy") -> Path:
    import torch
    from torch.utils.data import DataLoader

    torch.manual_seed(config.seed)
    np.random.seed(config.seed)

    x, y = load_dataset_arrays(config.data_dir, config.frame_stack)
    xt, yt, xv, yv = train_val_split(x, y, config.val_fraction, config.seed)
    print(
        f"dataset: {len(x)} samples ({len(xt)} train / {len(xv)} val), "
        f"frame stack {config.frame_stack}, {len(config.action_keys)} actions"
    )
    per_key_rate = ", ".join(
        f"{k}={y[:, i].mean():.3f}" for i, k in enumerate(config.action_keys)
    )
    print(f"key held-rates: {per_key_rate}")

    train_loader = DataLoader(
        BCFrameDataset(xt, yt), batch_size=config.batch_size, shuffle=True
    )
    val_loader = (
        DataLoader(BCFrameDataset(xv, yv), batch_size=config.batch_size)
        if len(xv)
        else None
    )

    model = build_policy(
        config.frame_stack,
        len(config.action_keys),
        frame_height=config.frame_height,
        frame_width=config.frame_width,
    )
    pos_weight = torch.from_numpy(positive_weights(yt if len(yt) else y))
    loss_fn = torch.nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)

    models_dir = Path(config.models_dir)
    models_dir.mkdir(parents=True, exist_ok=True)
    best_path = models_dir / f"{out_name}.pt"
    best_val = float("inf")

    for epoch in range(1, config.epochs + 1):
        model.train()
        total, count = 0.0, 0
        for bx, by in train_loader:
            optimizer.zero_grad()
            loss = loss_fn(model(bx), by)
            loss.backward()
            optimizer.step()
            total += float(loss.detach()) * len(bx)
            count += len(bx)
        train_loss = total / max(count, 1)

        if val_loader is not None:
            model.eval()
            vtotal, vcount, correct, labels = 0.0, 0, 0, 0
            with torch.no_grad():
                for bx, by in val_loader:
                    logits = model(bx)
                    vtotal += float(loss_fn(logits, by)) * len(bx)
                    vcount += len(bx)
                    pred = (torch.sigmoid(logits) >= 0.5).float()
                    correct += int((pred == by).sum())
                    labels += by.numel()
            val_loss = vtotal / max(vcount, 1)
            acc = correct / max(labels, 1)
            marker = ""
            if val_loss < best_val:
                best_val = val_loss
                torch.save(model.state_dict(), best_path)
                marker = "  <- best, saved"
            print(
                f"epoch {epoch:3d}  train {train_loss:.4f}  val {val_loss:.4f}  "
                f"per-key acc {acc:.3f}{marker}"
            )
        else:
            torch.save(model.state_dict(), best_path)
            print(f"epoch {epoch:3d}  train {train_loss:.4f}  saved")

    # Export the best checkpoint, not the last epoch.
    model.load_state_dict(torch.load(best_path, weights_only=True))
    onnx_path = models_dir / f"{out_name}.onnx"
    export_onnx(model, config, onnx_path)
    if not verify_onnx(onnx_path, config):
        raise RuntimeError(f"exported model failed verification: {onnx_path}")
    print(f"exported and verified {onnx_path} (this file is your downloadable model)")
    return onnx_path
