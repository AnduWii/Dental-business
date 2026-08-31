import numpy as np

from rusty_pilot.dataset import positive_weights, stack_windows, train_val_split
from rusty_pilot.recorder import load_shard, save_shard


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
