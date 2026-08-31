import numpy as np
import pytest

from rusty_pilot.actions import (
    DEFAULT_ACTION_KEYS,
    decode_vector,
    diff_key_sets,
    encode_keys,
    sigmoid,
)


def test_encode_decode_roundtrip():
    held = {"w", "space", "m1"}
    vec = encode_keys(held, DEFAULT_ACTION_KEYS)
    assert vec.shape == (len(DEFAULT_ACTION_KEYS),)
    assert decode_vector(vec, DEFAULT_ACTION_KEYS) == held


def test_encode_ignores_unknown_keys():
    vec = encode_keys({"w", "not_a_key"}, DEFAULT_ACTION_KEYS)
    assert decode_vector(vec, DEFAULT_ACTION_KEYS) == {"w"}


def test_decode_threshold():
    vec = np.zeros(len(DEFAULT_ACTION_KEYS), dtype=np.float32)
    vec[0] = 0.51  # w
    vec[1] = 0.49  # a
    assert decode_vector(vec, DEFAULT_ACTION_KEYS, threshold=0.5) == {"w"}


def test_decode_rejects_wrong_length():
    with pytest.raises(ValueError):
        decode_vector(np.zeros(3), DEFAULT_ACTION_KEYS)


def test_diff_key_sets():
    press, release = diff_key_sets({"w", "a"}, {"w", "d"})
    assert press == {"d"}
    assert release == {"a"}


def test_sigmoid_matches_definition_and_is_stable():
    x = np.array([-1000.0, -1.0, 0.0, 1.0, 1000.0], dtype=np.float32)
    out = sigmoid(x)
    assert out[0] == pytest.approx(0.0, abs=1e-6)
    assert out[2] == pytest.approx(0.5)
    assert out[4] == pytest.approx(1.0, abs=1e-6)
    assert np.all((out >= 0) & (out <= 1))
