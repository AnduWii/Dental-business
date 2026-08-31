"""Default Rusty Plane task set, written out as tasks.json by `python -m rusty_pilot init`.

Grounded in the Rusty Plane wiki (see docs/TRAINING.md for sources): tape patches
hull holes, the propane torch is HELD on leaking pipes, lights are click minigames
(wire color-matching or bulb replacement), windows are nailed shut with hammer
clicks after hail, jerry cans refuel, and the bike pump at the back restores oxygen
with repeated pumps. The wiki documents no on-screen highlight colors, so every
entry here needs a template PNG you capture yourself from YOUR screen with
`python -m rusty_pilot calibrate` (crop the interaction prompt or the broken-object
look). Until a task's template exists, that task simply stays inactive.

Scripts are the "I am standing at the task, do the interaction" part; getting NEAR
tasks is the learned policy's job. Hold times are starting guesses; tune them to
what you observe in-game. `move_mouse_to_match: true` aims the cursor at the
matched cue first so m1 steps click on it (bulbs, nails, puddles).
"""

from __future__ import annotations

import json
from pathlib import Path


def _taps(key: str, count: int, hold: float = 0.25, gap: float = 0.3) -> list[dict]:
    """A click/tap sequence: press `key` for `hold`s, release for `gap`s, x count."""
    steps: list[dict] = []
    for i in range(count):
        steps.append({"keys": [key], "seconds": hold})
        if i < count - 1:
            steps.append({"keys": [], "seconds": gap})
    return steps


# Keys used below must exist in Config.action_keys or the agent refuses to start.
# Order matters: earlier entries win when several cues are on screen at once, so
# the list is roughly sorted by urgency (fire-feeding leaks first).
DEFAULT_TASKS: list[dict] = [
    {
        "name": "weld_pipe",
        "template": "weld_pipe.png",
        "comment": "Leaking/burning fuel pipe. Equip torch (slot 1), hold m1 on the pipe. Wiki: hold duration must be learned; 3s is a starting guess.",
        "threshold": 0.84,
        "cooldown_seconds": 12.0,
        "move_mouse_to_match": True,
        "script": [{"keys": ["1"], "seconds": 0.3}, {"keys": [], "seconds": 0.2}]
        + [{"keys": ["m1"], "seconds": 3.0}],
    },
    {
        "name": "patch_hole",
        "template": "patch_hole.png",
        "comment": "Hull hole, patched with tape; drains oxygen while open. Hold E on the prompt.",
        "threshold": 0.84,
        "cooldown_seconds": 10.0,
        "script": [{"keys": ["e"], "seconds": 3.0}],
    },
    {
        "name": "fix_lights_bulbs",
        "template": "fix_lights.png",
        "comment": "Broken light. The bulb minigame is click-based (replace up to 5 bulbs), so click the matched cue repeatedly. The wire color-matching variant needs your judgement; see TRAINING.md.",
        "threshold": 0.84,
        "cooldown_seconds": 10.0,
        "move_mouse_to_match": True,
        "script": _taps("m1", 5),
    },
    {
        "name": "fix_window",
        "template": "fix_window.png",
        "comment": "Window broken by hail; vents oxygen. Nailing is click-based (several hammer clicks), aim at the cue.",
        "threshold": 0.84,
        "cooldown_seconds": 10.0,
        "move_mouse_to_match": True,
        "script": _taps("m1", 6),
    },
    {
        "name": "mop_fuel_puddle",
        "template": "mop_puddle.png",
        "comment": "Fuel puddle under a leak; slip hazard, catches fire. Equip mop (slot 1) and swing at the puddle.",
        "threshold": 0.84,
        "cooldown_seconds": 10.0,
        "move_mouse_to_match": True,
        "script": [{"keys": ["1"], "seconds": 0.3}, {"keys": [], "seconds": 0.2}]
        + _taps("m1", 3, hold=0.4),
    },
    {
        "name": "refuel",
        "template": "refuel.png",
        "comment": "Jerry-can refuel point; the plane stalls at zero fuel. Hold E on the prompt.",
        "threshold": 0.84,
        "cooldown_seconds": 15.0,
        "script": [{"keys": ["e"], "seconds": 4.0}],
    },
    {
        "name": "pump_oxygen",
        "template": "pump_oxygen.png",
        "comment": "Bike pump at the back of the fuselage. Wiki: pump repeatedly until oxygen recovers, so several E presses.",
        "threshold": 0.84,
        "cooldown_seconds": 15.0,
        "script": _taps("e", 6, hold=0.5, gap=0.4),
    },
]


def write_default_tasks_file(path: str | Path, overwrite: bool = False) -> bool:
    """Write tasks.json with the defaults. Returns False if it already existed."""
    path = Path(path)
    if path.exists() and not overwrite:
        return False
    path.write_text(json.dumps({"tasks": DEFAULT_TASKS}, indent=2) + "\n", encoding="utf-8")
    return True
