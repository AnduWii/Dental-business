"""Sending input to the game: WASD movement, interact key, mouse button.

Uses pydirectinput (install the maintained fork, pydirectinput-rgx; same import name)
because Roblox reads DirectInput scan codes sent via SendInput and ignores the
virtual-key events plain pyautogui sends. Windows-only; imported lazily so the rest
of the kit works on any OS.

Safety rules, enforced here and nowhere else:
- `panic()` releases every key/button immediately.
- If the Roblox window loses focus (alt-tab, popup), the controller refuses to send
  input and releases everything, so the bot can never type into another app.
"""

from __future__ import annotations

from .actions import diff_key_sets
from .config import Config

MOUSE_BUTTONS = {"m1": "left", "m2": "right"}


def _load_pydirectinput():
    try:
        import pydirectinput
    except ImportError as exc:  # pragma: no cover
        raise ImportError(
            "pydirectinput is required to control the game (Windows only): "
            "pip install pydirectinput-rgx"
        ) from exc
    # pydirectinput inherits pyautogui-style throttling; a per-call pause of even
    # 100 ms would make held-key transitions mushy at 10 actions per second.
    pydirectinput.PAUSE = 0.0
    pydirectinput.FAILSAFE = False  # our kill switch (config.kill_switch_key) replaces it
    return pydirectinput


def game_window_focused(title: str, exact: bool = True) -> bool:
    """True if the foreground window title matches `title` (case-insensitive).

    Exact matching by default: the Roblox player window is titled exactly "Roblox",
    while the Studio editor is "Roblox Studio", which a substring check would wrongly
    accept. Uses pygetwindow on Windows. On other platforms (or if the check fails)
    returns False, which fails safe: the controller stays silent.
    """
    try:
        import pygetwindow
    except ImportError:  # pragma: no cover
        return False
    try:
        window = pygetwindow.getActiveWindow()
    except Exception:  # pragma: no cover
        return False
    if window is None or window.title is None:
        return False
    active = window.title.strip().lower()
    wanted = title.strip().lower()
    return active == wanted if exact else wanted in active


class GameController:
    """Holds keys down / releases them so the game sees continuous movement."""

    def __init__(self, config: Config):
        self.config = config
        self._pdi = _load_pydirectinput()
        self._held: set[str] = set()

    @property
    def held(self) -> set[str]:
        return set(self._held)

    def focused(self) -> bool:
        return not self.config.require_window_focus or game_window_focused(
            self.config.game_window_title, self.config.window_title_exact
        )

    def apply(self, target: set[str]) -> None:
        """Press/release the minimum set of keys to make `target` the held set."""
        if not self.focused():
            self.panic()
            return
        to_press, to_release = diff_key_sets(self._held, target)
        for key in to_release:
            self._release(key)
        for key in to_press:
            self._press(key)

    def move_to(self, x: int, y: int) -> None:
        """Move the cursor to absolute screen pixel (x, y). Used by task scripts to
        aim clicks at a matched template (Roblox 2D UI accepts absolute positions;
        only the 3D camera needs relative deltas)."""
        if self.focused():
            self._pdi.moveTo(x, y)

    def panic(self) -> None:
        """Release everything, immediately. Safe to call repeatedly."""
        for key in list(self._held):
            self._release(key)

    # ------------------------------------------------------------------
    def _press(self, key: str) -> None:
        if key in MOUSE_BUTTONS:
            self._pdi.mouseDown(button=MOUSE_BUTTONS[key])
        else:
            self._pdi.keyDown(key)
        self._held.add(key)

    def _release(self, key: str) -> None:
        if key in MOUSE_BUTTONS:
            self._pdi.mouseUp(button=MOUSE_BUTTONS[key])
        else:
            self._pdi.keyUp(key)
        self._held.discard(key)
