"""The rule layer: reliable scripted reactions on top of the learned policy.

Behavioral cloning is great at "walk around like the player did" and bad at
"never miss the E prompt". So the agent runs two brains:

1. The learned policy decides moment-to-moment movement.
2. This task engine watches the full-resolution frame for known visual cues
   (calibrated template images of Rusty Plane's task prompts: the mop pickup, a
   broken light's wire panel, the refuel prompt, ...). When a cue is on screen,
   the engine takes over and plays a short scripted key sequence (for example:
   hold E for three seconds to interact), then hands control back.

Rules live in tasks.json; templates are PNG crops the user captures once with
`python -m rusty_pilot calibrate`. All decision logic here is pure and tested;
only the frame pixels come from the OS.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np


def match_template(
    frame_gray: np.ndarray, template_gray: np.ndarray
) -> tuple[float, tuple[int, int]]:
    """Best normalized match of template in frame: (score in [-1, 1], center (x, y)).

    Pure OpenCV, no OS calls. The center is in `frame_gray` pixel coordinates.
    """
    fh, fw = frame_gray.shape[:2]
    th, tw = template_gray.shape[:2]
    if th > fh or tw > fw:
        return -1.0, (0, 0)
    result = cv2.matchTemplate(frame_gray, template_gray, cv2.TM_CCOEFF_NORMED)
    _, score, _, top_left = cv2.minMaxLoc(result)
    center = (top_left[0] + tw // 2, top_left[1] + th // 2)
    return float(score), center


@dataclass
class ScriptStep:
    """Hold `keys` for `seconds`. An empty key set is a deliberate pause."""

    keys: tuple[str, ...]
    seconds: float


@dataclass
class TaskRule:
    name: str
    template: str  # path to the calibrated template PNG, relative to templates_dir
    script: list[ScriptStep]
    threshold: float = 0.82  # template match confidence needed to trigger
    cooldown_seconds: float = 8.0  # min time between triggers of this rule
    region: tuple[int, int, int, int] | None = None  # (left, top, w, h) crop, optional
    # Move the cursor to the matched cue before playing the script, so "m1" steps
    # click ON the thing (bulbs, nails, puddles) instead of wherever the mouse was.
    move_mouse_to_match: bool = False

    _template_gray: np.ndarray | None = field(default=None, repr=False, compare=False)
    _last_fired: float = field(default=float("-inf"), repr=False, compare=False)

    def load_template(self, templates_dir: str | Path) -> bool:
        path = Path(templates_dir) / self.template
        if not path.exists():
            return False
        image = cv2.imread(str(path), cv2.IMREAD_GRAYSCALE)
        if image is None:
            return False
        self._template_gray = image
        return True

    def score(self, frame_gray: np.ndarray) -> tuple[float, tuple[int, int]]:
        """(match score, cue center in full-frame pixel coordinates)."""
        if self._template_gray is None:
            return -1.0, (0, 0)
        area = frame_gray
        offset_x, offset_y = 0, 0
        if self.region is not None:
            left, top, width, height = self.region
            area = frame_gray[top : top + height, left : left + width]
            offset_x, offset_y = left, top
            if area.size == 0:
                return -1.0, (0, 0)
        score, (cx, cy) = match_template(area, self._template_gray)
        return score, (cx + offset_x, cy + offset_y)


class ActiveScript:
    """A rule's script mid-playback. Time-driven so the caller owns the clock.

    `match_center` is the cue's (x, y) in capture-frame pixels when the rule asked
    for mouse aiming, else None.
    """

    def __init__(
        self,
        rule_name: str,
        steps: list[ScriptStep],
        started_at: float,
        match_center: tuple[int, int] | None = None,
    ):
        self.rule_name = rule_name
        self.steps = steps
        self.started_at = started_at
        self.match_center = match_center
        self.total = sum(step.seconds for step in steps)

    def keys_at(self, now: float) -> set[str] | None:
        """Keys to hold at time `now`, or None when the script has finished."""
        elapsed = now - self.started_at
        if elapsed >= self.total:
            return None
        for step in self.steps:
            if elapsed < step.seconds:
                return set(step.keys)
            elapsed -= step.seconds
        return None  # pragma: no cover (float edge; treated as finished)


class TaskEngine:
    """Holds the rules, decides when a scripted reaction should run."""

    def __init__(self, rules: list[TaskRule], templates_dir: str | Path):
        self.templates_dir = Path(templates_dir)
        self.rules = rules
        self.missing: list[str] = []
        for rule in rules:
            if not rule.load_template(self.templates_dir):
                self.missing.append(rule.name)
        self.active_rules = [r for r in rules if r._template_gray is not None]

    def check(self, frame_gray: np.ndarray, now: float) -> ActiveScript | None:
        """First rule (file order = priority) whose cue is on screen and off cooldown."""
        for rule in self.active_rules:
            if now - rule._last_fired < rule.cooldown_seconds:
                continue
            score, center = rule.score(frame_gray)
            if score >= rule.threshold:
                rule._last_fired = now
                return ActiveScript(
                    rule.name,
                    rule.script,
                    now,
                    match_center=center if rule.move_mouse_to_match else None,
                )
        return None

    # ------------------------------------------------------------------
    @staticmethod
    def parse_rules(raw: list[dict]) -> list[TaskRule]:
        rules = []
        for entry in raw:
            steps = [
                ScriptStep(keys=tuple(step["keys"]), seconds=float(step["seconds"]))
                for step in entry["script"]
            ]
            rules.append(
                TaskRule(
                    name=entry["name"],
                    template=entry["template"],
                    script=steps,
                    threshold=float(entry.get("threshold", 0.82)),
                    cooldown_seconds=float(entry.get("cooldown_seconds", 8.0)),
                    region=tuple(entry["region"]) if entry.get("region") else None,
                    move_mouse_to_match=bool(entry.get("move_mouse_to_match", False)),
                )
            )
        return rules

    @classmethod
    def from_file(cls, tasks_file: str | Path, templates_dir: str | Path) -> "TaskEngine":
        raw = json.loads(Path(tasks_file).read_text(encoding="utf-8"))
        return cls(cls.parse_rules(raw["tasks"]), templates_dir)
