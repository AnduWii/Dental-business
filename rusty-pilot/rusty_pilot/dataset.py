"""Turning recorded shards into (frame stack -> action) training samples.

The windowing math lives in pure numpy helpers; the torch Dataset is a thin wrapper,
imported only by training code so the rest of the kit has no torch dependency.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from .recorder import list_shards, load_shard


def stack_windows(
    frames: np.ndarray, actions: np.ndarray, frame_stack: int
) -> tuple[np.ndarray, np.ndarray]:
    """Build every valid (stacked frames, action) pair from one contiguous shard.

    For sample i the model sees frames [i - frame_stack + 1 .. i] and must predict
    the action vector at i (the keys the player was holding at that moment).

    Returns (X uint8 (M, frame_stack, H, W), Y float32 (M, K)) where
    M = N - frame_stack + 1, or empty arrays when the shard is too short.
    """
    n = frames.shape[0]
    if n < frame_stack:
        h, w = frames.shape[1:3]
        return (
            np.empty((0, frame_stack, h, w), dtype=np.uint8),
            np.empty((0, actions.shape[1]), dtype=np.float32),
        )
    # sliding_window_view gives (M, H, W, frame_stack); move the stack axis forward.
    windows = np.lib.stride_tricks.sliding_window_view(frames, frame_stack, axis=0)
    x = np.moveaxis(windows, -1, 1)
    y = actions[frame_stack - 1 :]
    return np.ascontiguousarray(x, dtype=np.uint8), y.astype(np.float32)


def load_dataset_arrays(
    data_dir: str | Path, frame_stack: int
) -> tuple[np.ndarray, np.ndarray]:
    """Load and window every shard under data_dir. Shards never cross-window."""
    xs, ys = [], []
    for shard in list_shards(data_dir):
        frames, actions = load_shard(shard)
        x, y = stack_windows(frames, actions, frame_stack)
        if len(x):
            xs.append(x)
            ys.append(y)
    if not xs:
        raise FileNotFoundError(
            f"no usable shards under {data_dir}. Record a session first: "
            "python -m rusty_pilot record"
        )
    return np.concatenate(xs), np.concatenate(ys)


def positive_weights(y: np.ndarray, cap: float = 20.0) -> np.ndarray:
    """Per-key pos_weight for BCEWithLogitsLoss.

    Most frames hold only one or two keys, so positives are rare for keys like "e";
    weighting keeps the model from learning "never press anything". Capped so an
    almost-never-pressed key cannot blow up the loss.
    """
    pos = y.sum(axis=0)
    neg = y.shape[0] - pos
    with np.errstate(divide="ignore", invalid="ignore"):
        w = np.where(pos > 0, neg / np.maximum(pos, 1), 1.0)
    return np.clip(w, 1.0, cap).astype(np.float32)


def train_val_split(
    x: np.ndarray, y: np.ndarray, val_fraction: float, seed: int
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Shuffled split. Deterministic for a given seed."""
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(x))
    n_val = max(1, int(len(x) * val_fraction)) if len(x) > 1 else 0
    val_idx, train_idx = order[:n_val], order[n_val:]
    return x[train_idx], y[train_idx], x[val_idx], y[val_idx]


class BCFrameDataset:
    """Torch-compatible Dataset over pre-windowed arrays (lazy torch import)."""

    def __init__(self, x: np.ndarray, y: np.ndarray):
        import torch

        self._torch = torch
        self.x = x
        self.y = y

    def __len__(self) -> int:
        return len(self.x)

    def __getitem__(self, idx: int):
        x = self._torch.from_numpy(self.x[idx].astype(np.float32) / 255.0)
        y = self._torch.from_numpy(self.y[idx])
        return x, y
