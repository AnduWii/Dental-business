import json

import cv2
import numpy as np
import pytest

from rusty_pilot.tasks.engine import (
    ActiveScript,
    ScriptStep,
    TaskEngine,
    TaskRule,
    match_template,
)
from rusty_pilot.tasks.library import DEFAULT_TASKS, write_default_tasks_file


def make_template(tmp_path, name="cue.png"):
    """A distinctive 12x12 checker pattern saved as a template PNG."""
    template = np.zeros((12, 12), dtype=np.uint8)
    template[::2, ::2] = 255
    template[1::2, 1::2] = 180
    path = tmp_path / name
    cv2.imwrite(str(path), template)
    return template, path


def frame_with(template, at_xy, size=(80, 120)):
    frame = np.full(size, 30, dtype=np.uint8)
    x, y = at_xy
    frame[y : y + template.shape[0], x : x + template.shape[1]] = template
    return frame


def test_match_template_score_and_center(tmp_path):
    template, _ = make_template(tmp_path)
    frame = frame_with(template, at_xy=(50, 20))
    score, (cx, cy) = match_template(frame, template)
    assert score > 0.95
    assert (cx, cy) == (50 + 6, 20 + 6)


def test_match_template_absent_cue(tmp_path):
    template, _ = make_template(tmp_path)
    frame = np.full((80, 120), 30, dtype=np.uint8)
    score, _ = match_template(frame, template)
    assert score < 0.5


def test_match_template_too_large():
    frame = np.zeros((10, 10), dtype=np.uint8)
    template = np.zeros((20, 20), dtype=np.uint8)
    assert match_template(frame, template)[0] == -1.0


def test_engine_triggers_and_cooldown(tmp_path):
    template, path = make_template(tmp_path)
    rule = TaskRule(
        name="fix",
        template=path.name,
        script=[ScriptStep(keys=("e",), seconds=2.0)],
        threshold=0.9,
        cooldown_seconds=5.0,
    )
    engine = TaskEngine([rule], templates_dir=tmp_path)
    assert engine.missing == []
    frame = frame_with(template, at_xy=(10, 10))

    active = engine.check(frame, now=100.0)
    assert active is not None and active.rule_name == "fix"
    assert active.match_center is None  # move_mouse_to_match defaults off
    # still on cooldown
    assert engine.check(frame, now=102.0) is None
    # cooldown expired
    assert engine.check(frame, now=106.0) is not None


def test_engine_match_center_respects_region_offset(tmp_path):
    template, path = make_template(tmp_path)
    rule = TaskRule(
        name="aim",
        template=path.name,
        script=[ScriptStep(keys=("m1",), seconds=0.5)],
        threshold=0.9,
        region=(40, 10, 60, 40),  # left, top, w, h
        move_mouse_to_match=True,
    )
    engine = TaskEngine([rule], templates_dir=tmp_path)
    frame = frame_with(template, at_xy=(50, 20))
    active = engine.check(frame, now=0.0)
    assert active is not None
    assert active.match_center == (56, 26)  # full-frame coordinates, not region-local


def test_engine_no_trigger_below_threshold(tmp_path):
    template, path = make_template(tmp_path)
    rule = TaskRule(
        name="fix", template=path.name, script=[ScriptStep(("e",), 1.0)], threshold=0.99
    )
    engine = TaskEngine([rule], templates_dir=tmp_path)
    assert engine.check(np.full((80, 120), 30, dtype=np.uint8), now=0.0) is None


def test_engine_missing_template_is_inactive(tmp_path):
    rule = TaskRule(name="ghost", template="nope.png", script=[ScriptStep(("e",), 1.0)])
    engine = TaskEngine([rule], templates_dir=tmp_path)
    assert engine.missing == ["ghost"]
    assert engine.active_rules == []


def test_active_script_timeline():
    script = ActiveScript(
        "seq",
        [ScriptStep(("1",), 0.5), ScriptStep((), 0.2), ScriptStep(("m1",), 1.0)],
        started_at=10.0,
    )
    assert script.keys_at(10.1) == {"1"}
    assert script.keys_at(10.6) == set()
    assert script.keys_at(11.0) == {"m1"}
    assert script.keys_at(11.75) is None  # finished


def test_default_tasks_parse_and_use_known_keys(tmp_path):
    path = tmp_path / "tasks.json"
    assert write_default_tasks_file(path)
    assert not write_default_tasks_file(path)  # no overwrite by default
    raw = json.loads(path.read_text(encoding="utf-8"))
    rules = TaskEngine.parse_rules(raw["tasks"])
    assert {r.name for r in rules} == {t["name"] for t in DEFAULT_TASKS}
    from rusty_pilot.actions import DEFAULT_ACTION_KEYS

    for rule in rules:
        assert rule.script, f"{rule.name} has an empty script"
        for step in rule.script:
            unknown = set(step.keys) - set(DEFAULT_ACTION_KEYS)
            assert not unknown, f"{rule.name} uses unknown keys {unknown}"


def test_parse_rules_rejects_missing_fields():
    with pytest.raises(KeyError):
        TaskEngine.parse_rules([{"name": "broken"}])
