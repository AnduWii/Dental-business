"""Run configuration, one JSON file that every CLI command shares.

A config file is optional: `Config()` gives sane defaults for a 1920x1080 primary
monitor. Users edit `config.json` (created by `python -m rusty_pilot init`) rather
than code.
"""

from __future__ import annotations

import dataclasses
import json
from dataclasses import dataclass, field
from pathlib import Path

from .keys import DEFAULT_ACTION_KEYS


@dataclass
class Config:
    # Screen capture ------------------------------------------------------------
    # Region of the screen to capture, in pixels. Defaults to a full 1080p monitor.
    capture_left: int = 0
    capture_top: int = 0
    capture_width: int = 1920
    capture_height: int = 1080
    monitor_index: int = 1  # mss monitor number; 1 is the primary monitor

    # Frames are downscaled to this size (grayscale) before storage/inference.
    # 128x72 keeps the 16:9 aspect ratio and trains fast on CPU.
    frame_width: int = 128
    frame_height: int = 72

    # Loop rates ----------------------------------------------------------------
    capture_fps: int = 10  # recording and inference rate

    # Model input ---------------------------------------------------------------
    frame_stack: int = 4  # how many past frames the model sees at once

    # Action space --------------------------------------------------------------
    action_keys: tuple[str, ...] = field(default_factory=lambda: DEFAULT_ACTION_KEYS)
    action_threshold: float = 0.5  # probability above which a key is held

    # Safety --------------------------------------------------------------------
    kill_switch_key: str = "f8"  # panic key: instantly stops record/play loops
    game_window_title: str = "Roblox"  # foreground window title to require
    # Exact matching by default: the Roblox player window is titled exactly "Roblox",
    # and substring matching would also accept "Roblox Studio".
    window_title_exact: bool = True
    require_window_focus: bool = True

    # Paths (relative to the rusty-pilot folder unless absolute) ----------------
    data_dir: str = "data"
    models_dir: str = "models"
    templates_dir: str = "templates"
    tasks_file: str = "tasks.json"

    # Training ------------------------------------------------------------------
    batch_size: int = 64
    epochs: int = 12
    learning_rate: float = 3e-4
    val_fraction: float = 0.1
    seed: int = 7

    # ---------------------------------------------------------------------------
    def frame_shape(self) -> tuple[int, int]:
        """(height, width) of stored frames."""
        return (self.frame_height, self.frame_width)

    def save(self, path: str | Path) -> None:
        payload = dataclasses.asdict(self)
        payload["action_keys"] = list(self.action_keys)
        Path(path).write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    @classmethod
    def load(cls, path: str | Path) -> "Config":
        raw = json.loads(Path(path).read_text(encoding="utf-8"))
        known = {f.name for f in dataclasses.fields(cls)}
        unknown = set(raw) - known
        if unknown:
            raise ValueError(f"unknown config keys: {sorted(unknown)}")
        if "action_keys" in raw:
            raw["action_keys"] = tuple(raw["action_keys"])
        return cls(**raw)

    @classmethod
    def load_or_default(cls, path: str | Path | None) -> "Config":
        if path is None:
            default = Path("config.json")
            return cls.load(default) if default.exists() else cls()
        return cls.load(path)
