import pytest

from rusty_pilot.agent import validate_model_compat, validate_task_keys
from rusty_pilot.config import Config
from rusty_pilot.tasks.engine import ScriptStep, TaskEngine, TaskRule


def sidecar_for(config: Config) -> dict:
    return {
        "action_keys": list(config.action_keys),
        "frame_stack": config.frame_stack,
        "frame_width": config.frame_width,
        "frame_height": config.frame_height,
        "capture_fps": config.capture_fps,
    }


def test_model_compat_accepts_matching():
    config = Config()
    validate_model_compat(sidecar_for(config), config)  # must not raise


def test_model_compat_rejects_key_mismatch():
    config = Config()
    sidecar = sidecar_for(config)
    sidecar["action_keys"] = ["w", "a"]
    with pytest.raises(ValueError, match="model/config mismatch"):
        validate_model_compat(sidecar, config)


def test_model_compat_rejects_geometry_mismatch():
    config = Config()
    sidecar = sidecar_for(config)
    sidecar["frame_width"] = 999
    with pytest.raises(ValueError, match="frame_width"):
        validate_model_compat(sidecar, config)


def test_model_compat_rejects_fps_mismatch():
    config = Config()
    sidecar = sidecar_for(config)
    sidecar["capture_fps"] = config.capture_fps + 5
    with pytest.raises(ValueError, match="capture_fps"):
        validate_model_compat(sidecar, config)


def test_model_compat_tolerates_missing_fps():
    # Sidecars exported before capture_fps existed must still load.
    config = Config()
    sidecar = sidecar_for(config)
    del sidecar["capture_fps"]
    validate_model_compat(sidecar, config)  # must not raise


def test_task_keys_validation(tmp_path):
    config = Config()
    good = TaskRule("ok", "x.png", [ScriptStep(("e",), 1.0)])
    bad = TaskRule("bad", "y.png", [ScriptStep(("q",), 1.0)])
    validate_task_keys(TaskEngine([good], tmp_path), config)  # must not raise
    with pytest.raises(ValueError, match="'bad' uses keys"):
        validate_task_keys(TaskEngine([bad], tmp_path), config)


def test_config_roundtrip(tmp_path):
    config = Config(capture_width=1280, capture_height=720, epochs=3)
    path = tmp_path / "config.json"
    config.save(path)
    loaded = Config.load(path)
    assert loaded == config
    assert isinstance(loaded.action_keys, tuple)


def test_config_rejects_unknown_keys(tmp_path):
    path = tmp_path / "config.json"
    path.write_text('{"capture_widht": 100}', encoding="utf-8")  # typo on purpose
    with pytest.raises(ValueError, match="unknown config keys"):
        Config.load(path)
