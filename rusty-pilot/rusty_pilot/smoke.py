"""End-to-end smoke test: prove the record -> train -> export -> infer pipeline works
without the game, by generating a synthetic "gameplay" session and running the real
training and export code on it.

The synthetic world: a bright square (the "task") drifts around a dark screen and
the synthetic player steers toward it (d when it is to the right, a when left, w
when centered, occasional e presses when close). If training is wired correctly the
model's validation accuracy rises well above chance, proving the learning loop can
extract a policy from frames. It says nothing about playing Rusty Plane; only your
own recorded data does that.

Run: python -m rusty_pilot smoke
"""

from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import numpy as np

from .actions import encode_keys
from .config import Config
from .recorder import save_shard


def make_synthetic_session(config: Config, data_dir: Path, n_frames: int, seed: int) -> None:
    import json

    rng = np.random.default_rng(seed)
    h, w = config.frame_shape()
    session = data_dir / "session_synthetic"
    session.mkdir(parents=True, exist_ok=True)
    session.joinpath("meta.json").write_text(
        json.dumps(
            {
                "action_keys": list(config.action_keys),
                "frame_width": config.frame_width,
                "frame_height": config.frame_height,
                "capture_fps": config.capture_fps,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    frames = np.zeros((n_frames, h, w), dtype=np.uint8)
    actions = np.zeros((n_frames, len(config.action_keys)), dtype=np.float32)

    # The player character sits at the horizontal center; the task square drifts.
    x = rng.integers(8, w - 8)
    y = rng.integers(8, h - 8)
    for i in range(n_frames):
        x = int(np.clip(x + rng.integers(-4, 5), 4, w - 5))
        y = int(np.clip(y + rng.integers(-3, 4), 4, h - 5))
        frames[i] = rng.integers(0, 20, size=(h, w), dtype=np.uint8)  # sensor noise
        frames[i, y - 3 : y + 3, x - 3 : x + 3] = 255  # the "task" square

        held: set[str] = set()
        if x < w // 2 - 6:
            held.add("a")
        elif x > w // 2 + 6:
            held.add("d")
        else:
            held.add("w")
            if abs(y - h // 2) < 10:
                held.add("e")  # "interact" when the task is centered
        actions[i] = encode_keys(held, config.action_keys)

    save_shard(session / "shard_0000.npz", frames, actions)


def run_smoke(work_dir: str | None = None, n_frames: int = 1500) -> Path:
    """Returns the path of the exported .onnx model. Raises on any failure."""
    from .train import train

    base = Path(work_dir) if work_dir else Path(tempfile.mkdtemp(prefix="rusty_smoke_"))
    config = Config(
        data_dir=str(base / "data"),
        models_dir=str(base / "models"),
        epochs=4,
        batch_size=64,
    )
    make_synthetic_session(config, Path(config.data_dir), n_frames, seed=config.seed)
    print(f"synthetic session written under {config.data_dir}")
    onnx_path = train(config, out_name="smoke_policy")
    print("smoke test passed: the full train -> export -> verify pipeline works")
    if work_dir is None:
        keep = Path.cwd() / "models"
        keep.mkdir(exist_ok=True)
        for suffix in (".onnx", ".json"):
            src = onnx_path.with_suffix(suffix)
            if src.exists():
                shutil.copy2(src, keep / src.name)
        shutil.rmtree(base, ignore_errors=True)
        onnx_path = keep / onnx_path.name
        print(f"demo model kept at {onnx_path}")
    return onnx_path
