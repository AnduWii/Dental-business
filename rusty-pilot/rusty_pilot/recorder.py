"""Recording your own gameplay into training shards.

While you play Rusty Plane normally, the recorder captures, `capture_fps` times per
second, the downscaled screen frame plus a 0/1 vector of which action keys you are
holding. Sessions are saved as compressed .npz shards:

    data/session_YYYYmmdd_HHMMSS/shard_0000.npz   frames:  uint8  (N, H, W)
                                                  actions: float32 (N, K)
    data/session_YYYYmmdd_HHMMSS/meta.json        config snapshot for sanity checks

Shard save/load are pure functions so the dataset code and tests reuse them without
a screen or keyboard.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from .actions import encode_keys
from .config import Config

SHARD_FRAMES = 2000  # ~3.3 minutes per shard at 10 fps; keeps files ~15 MB


def normalize_key(key) -> str | None:
    """A pynput key object -> the lowercase name used in Config.action_keys.

    pynput delivers printable keys as KeyCode (has .char, no .name) and special
    keys as Key enums (has .name, no .char); handle both so a single-character
    kill switch or action key works the same as "f8" or "space".
    """
    char = getattr(key, "char", None)
    if char:
        return char.lower()
    name = getattr(key, "name", None)
    return name.lower() if name else None


def save_shard(path: str | Path, frames: np.ndarray, actions: np.ndarray) -> None:
    frames = np.asarray(frames, dtype=np.uint8)
    actions = np.asarray(actions, dtype=np.float32)
    if frames.shape[0] != actions.shape[0]:
        raise ValueError(
            f"frames ({frames.shape[0]}) and actions ({actions.shape[0]}) must align"
        )
    np.savez_compressed(path, frames=frames, actions=actions)


def load_shard(path: str | Path) -> tuple[np.ndarray, np.ndarray]:
    with np.load(path) as data:
        return data["frames"], data["actions"]


def list_shards(data_dir: str | Path) -> list[Path]:
    """All shard files under data_dir (any session), sorted for determinism."""
    return sorted(Path(data_dir).glob("session_*/shard_*.npz"))


@dataclass
class KeyStateTracker:
    """Tracks which action keys are physically held, fed by pynput listener callbacks.

    pynput key objects are normalized to the lowercase names used in Config.action_keys
    ("w", "space", "e", ...). Mouse button 1 is tracked as "m1".
    """

    action_keys: tuple[str, ...]
    held: set[str] = field(default_factory=set)

    def _normalize(self, key) -> str | None:
        return normalize_key(key)

    def on_press(self, key) -> None:
        name = self._normalize(key)
        if name in self.action_keys:
            self.held.add(name)

    def on_release(self, key) -> None:
        name = self._normalize(key)
        if name:
            self.held.discard(name)

    def on_click(self, x, y, button, pressed) -> None:
        name = {"left": "m1", "right": "m2"}.get(getattr(button, "name", ""), None)
        if name in self.action_keys:
            (self.held.add if pressed else self.held.discard)(name)

    def snapshot(self) -> np.ndarray:
        return encode_keys(set(self.held), self.action_keys)


class Recorder:
    """The live recording loop. Windows/desktop only (needs screen + input hooks)."""

    def __init__(self, config: Config, session_name: str):
        self.config = config
        self.session_dir = Path(config.data_dir) / f"session_{session_name}"
        self.session_dir.mkdir(parents=True, exist_ok=True)
        self.tracker = KeyStateTracker(config.action_keys)
        self._stop = False
        self._shard_index = 0

    def _start_listeners(self):
        try:
            from pynput import keyboard, mouse
        except ImportError as exc:  # pragma: no cover
            raise ImportError("pynput is required for recording: pip install pynput") from exc

        kill = self.config.kill_switch_key.lower()

        def on_press(key):
            self.tracker.on_press(key)
            if normalize_key(key) == kill:
                self._stop = True

        kb = keyboard.Listener(on_press=on_press, on_release=self.tracker.on_release)
        ms = mouse.Listener(on_click=self.tracker.on_click)
        kb.start()
        ms.start()
        return kb, ms

    def _flush(self, frames: list[np.ndarray], actions: list[np.ndarray]) -> None:
        if not frames:
            return
        shard_path = self.session_dir / f"shard_{self._shard_index:04d}.npz"
        save_shard(shard_path, np.stack(frames), np.stack(actions))
        print(f"saved {shard_path} ({len(frames)} frames)")
        self._shard_index += 1

    def run(self) -> None:
        from .capture import ScreenGrabber  # local import: needs a display

        self.session_dir.joinpath("meta.json").write_text(
            json.dumps(
                {
                    "action_keys": list(self.config.action_keys),
                    "frame_width": self.config.frame_width,
                    "frame_height": self.config.frame_height,
                    "capture_fps": self.config.capture_fps,
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        grabber = ScreenGrabber(self.config)
        kb, ms = self._start_listeners()
        interval = 1.0 / self.config.capture_fps
        frames: list[np.ndarray] = []
        actions: list[np.ndarray] = []
        print(
            f"recording at {self.config.capture_fps} fps. Play the game normally; "
            f"press {self.config.kill_switch_key.upper()} to stop."
        )
        try:
            next_tick = time.perf_counter()
            while not self._stop:
                _, small = grabber.grab()
                frames.append(small)
                actions.append(self.tracker.snapshot())
                if len(frames) >= SHARD_FRAMES:
                    self._flush(frames, actions)
                    frames, actions = [], []
                next_tick += interval
                delay = next_tick - time.perf_counter()
                if delay > 0:
                    time.sleep(delay)
                else:  # fell behind; resynchronize instead of spiraling
                    next_tick = time.perf_counter()
        finally:
            self._flush(frames, actions)
            kb.stop()
            ms.stop()
            grabber.close()
        print(f"session saved under {self.session_dir}")
