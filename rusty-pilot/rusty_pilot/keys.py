"""The action-key constants, in a module with zero third-party imports so the CLI
(config loading, `init`, `check`) starts even on a machine where numpy is not
installed yet and can report what is missing instead of crashing.
"""

from __future__ import annotations

# The default action space. Order matters: it defines the meaning of every column in
# recorded datasets and in the model's output layer. Changing it invalidates old
# recordings and models, so add new keys at the END and retrain.
#
# "m1" is the left mouse button (swings the mop, hammer, etc.). "1" equips the
# first backpack slot, where Rusty Plane puts your starting tool.
DEFAULT_ACTION_KEYS: tuple[str, ...] = ("w", "a", "s", "d", "space", "e", "m1", "1")

# Keys that move the character. Used by the safety layer: when the agent loses window
# focus or is paused, movement keys are always released first.
MOVEMENT_KEYS: frozenset[str] = frozenset({"w", "a", "s", "d", "space"})
