"""Action-space definitions: which keys the agent can press, and how key state
maps to and from the fixed-length vectors stored in datasets and produced by the model.

Everything in this module is pure logic (no OS calls) so it is unit-testable anywhere.
"""

from __future__ import annotations

import numpy as np

from .keys import DEFAULT_ACTION_KEYS, MOVEMENT_KEYS

__all__ = [
    "DEFAULT_ACTION_KEYS",
    "MOVEMENT_KEYS",
    "action_dim",
    "encode_keys",
    "decode_vector",
    "diff_key_sets",
    "sigmoid",
]


def action_dim(action_keys: tuple[str, ...] = DEFAULT_ACTION_KEYS) -> int:
    return len(action_keys)


def encode_keys(held: set[str], action_keys: tuple[str, ...] = DEFAULT_ACTION_KEYS) -> np.ndarray:
    """Encode the currently-held key set as a float32 0/1 vector."""
    vec = np.zeros(len(action_keys), dtype=np.float32)
    for i, key in enumerate(action_keys):
        if key in held:
            vec[i] = 1.0
    return vec


def decode_vector(
    vec: np.ndarray,
    action_keys: tuple[str, ...] = DEFAULT_ACTION_KEYS,
    threshold: float = 0.5,
) -> set[str]:
    """Decode a probability/0-1 vector back into the set of keys that should be held."""
    if vec.shape[-1] != len(action_keys):
        raise ValueError(
            f"vector has {vec.shape[-1]} entries but action space has {len(action_keys)} keys"
        )
    return {key for i, key in enumerate(action_keys) if float(vec[i]) >= threshold}


def diff_key_sets(current: set[str], target: set[str]) -> tuple[set[str], set[str]]:
    """Return (keys_to_press, keys_to_release) to move from `current` held keys to `target`."""
    return target - current, current - target


def sigmoid(x: np.ndarray) -> np.ndarray:
    """Numerically stable sigmoid for turning model logits into probabilities."""
    out = np.empty_like(x, dtype=np.float64)
    pos = x >= 0
    out[pos] = 1.0 / (1.0 + np.exp(-x[pos]))
    ex = np.exp(x[~pos])
    out[~pos] = ex / (1.0 + ex)
    return out.astype(np.float32)
