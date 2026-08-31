import json

import numpy as np
import pytest

from rusty_pilot.dataset import (
    load_dataset_arrays,
    positive_weights,
    stack_windows,
    train_val_split,
)
from rusty_pilot.recorder import load_shard, save_shard


def write_session(tmp_path, name="session_a", n=8, keys=("w", "a"), shape=(4, 5), meta=True):
    session = tmp_path / name
    session.mkdir()
    frames = np.zeros((n, *shape), dtype=np.uint8)
    actions = np.zeros((n, len(keys)), dtype=np.float32)
    save_shard(session / "shard_0000.npz", frames, actions)
    if meta:
        session.joinpath("meta.json").write_text(
            json.dumps(
                {
                    "action_keys": list(keys),
                    "frame_width": shape[1],
                    "frame_height": shape[0],
                    "capture_fps": 10,
                }
            ),
            encoding="utf-8",
        )
    return session


def test_shard_roundtrip(tmp_path):
    frames = np.random.default_rng(0).integers(0, 256, size=(10, 8, 12), dtype=np.uint8)
    actions = np.random.default_rng(1).integers(0, 2, size=(10, 7)).astype(np.float32)
    path = tmp_path / "shard_0000.npz"
    save_shard(path, frames, actions)
    f2, a2 = load_shard(path)
    assert np.array_equal(frames, f2)
    assert np.array_equal(actions, a2)


def test_stack_windows_alignment():
    # Frame i has constant value i, action i is [i]; window t must end at frame t
    # and carry action t.
    n, stack = 6, 3
    frames = np.stack([np.full((4, 5), i, dtype=np.uint8) for i in range(n)])
    actions = np.arange(n, dtype=np.float32).reshape(n, 1)
    x, y = stack_windows(frames, actions, stack)
    assert x.shape == (n - stack + 1, stack, 4, 5)
    assert y.shape == (n - stack + 1, 1)
    for t in range(len(x)):
        assert x[t, -1, 0, 0] == t + stack - 1  # newest frame last in the stack
        assert x[t, 0, 0, 0] == t  # oldest frame first
        assert y[t, 0] == t + stack - 1


def test_stack_windows_short_shard():
    frames = np.zeros((2, 4, 5), dtype=np.uint8)
    actions = np.zeros((2, 3), dtype=np.float32)
    x, y = stack_windows(frames, actions, frame_stack=4)
    assert len(x) == 0 and len(y) == 0
    assert x.shape[1:] == (4, 4, 5)


def test_positive_weights_balances_rare_keys():
    y = np.zeros((100, 2), dtype=np.float32)
    y[:50, 0] = 1.0  # key 0 held half the time
    y[:2, 1] = 1.0  # key 1 almost never held
    w = positive_weights(y)
    assert w[0] == 1.0
    assert w[1] == 20.0  # capped
    assert w.dtype == np.float32


def test_positive_weights_never_pressed_key():
    y = np.zeros((10, 1), dtype=np.float32)
    assert positive_weights(y)[0] == 1.0


def test_load_dataset_accepts_matching_session(tmp_path):
    write_session(tmp_path)
    x, y = load_dataset_arrays(
        tmp_path, 2, action_keys=("w", "a"), frame_width=5, frame_height=4
    )
    assert len(x) == 7 and y.shape[1] == 2


def test_load_dataset_rejects_mismatched_meta(tmp_path):
    write_session(tmp_path, keys=("a", "w"))  # same width, different order
    with pytest.raises(ValueError, match="different config"):
        load_dataset_arrays(tmp_path, 2, action_keys=("w", "a"), frame_width=5, frame_height=4)


def test_load_dataset_rejects_wrong_action_width_without_meta(tmp_path):
    write_session(tmp_path, keys=("w", "a", "s"), meta=False)
    with pytest.raises(ValueError, match="action columns"):
        load_dataset_arrays(tmp_path, 2, action_keys=("w", "a"), frame_width=5, frame_height=4)


def test_load_dataset_accepts_legacy_session_without_meta(tmp_path):
    write_session(tmp_path, meta=False)
    x, _ = load_dataset_arrays(
        tmp_path, 2, action_keys=("w", "a"), frame_width=5, frame_height=4
    )
    assert len(x) == 7


def test_train_val_split_partitions():
    x = np.arange(50).reshape(50, 1)
    y = np.arange(50).reshape(50, 1).astype(np.float32)
    xt, yt, xv, yv = train_val_split(x, y, val_fraction=0.2, seed=3)
    assert len(xt) == 40 and len(xv) == 10
    together = sorted(np.concatenate([xt, xv]).ravel().tolist())
    assert together == list(range(50))
    # deterministic
    xt2, _, _, _ = train_val_split(x, y, val_fraction=0.2, seed=3)
    assert np.array_equal(xt, xt2)
