"""Screen capture (mss) and frame preprocessing.

`preprocess_frame` is pure numpy/OpenCV and unit-testable anywhere. `ScreenGrabber`
touches the real screen, so it imports mss lazily and only works on a machine with a
display (your gaming PC, not CI).
"""

from __future__ import annotations

import numpy as np

from .config import Config

try:  # OpenCV is a hard dependency of the kit, but degrade with a clear error.
    import cv2
except ImportError as exc:  # pragma: no cover
    raise ImportError("opencv-python is required: pip install opencv-python") from exc


def preprocess_frame(frame_bgra: np.ndarray, config: Config) -> np.ndarray:
    """BGRA (or BGR) screen pixels -> uint8 grayscale frame of config.frame_shape().

    Grayscale keeps the dataset and model small; the game's task cues stay visible
    because the task engine (tasks/engine.py) matches templates on the full-size
    frame before downscaling.
    """
    if frame_bgra.ndim == 3 and frame_bgra.shape[2] == 4:
        gray = cv2.cvtColor(frame_bgra, cv2.COLOR_BGRA2GRAY)
    elif frame_bgra.ndim == 3 and frame_bgra.shape[2] == 3:
        gray = cv2.cvtColor(frame_bgra, cv2.COLOR_BGR2GRAY)
    elif frame_bgra.ndim == 2:
        gray = frame_bgra
    else:
        raise ValueError(f"unexpected frame shape {frame_bgra.shape}")
    resized = cv2.resize(
        gray, (config.frame_width, config.frame_height), interpolation=cv2.INTER_AREA
    )
    return resized.astype(np.uint8)


def frames_to_model_input(frames_u8: np.ndarray) -> np.ndarray:
    """uint8 (stack, H, W) -> float32 (1, stack, H, W) scaled to [0, 1]."""
    x = frames_u8.astype(np.float32) / 255.0
    return x[np.newaxis, ...]


def declare_dpi_awareness() -> None:
    """On Windows with display scaling (125%/150%), window coordinates and captured
    pixels disagree unless the process declares DPI awareness first. No-op elsewhere.
    """
    try:  # pragma: no cover (Windows only)
        import ctypes

        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        pass


class ScreenGrabber:
    """Grabs raw BGRA frames of the configured monitor region using mss.

    mss instances are not thread-safe; create the grabber on the thread that uses it.
    """

    def __init__(self, config: Config):
        self.config = config
        declare_dpi_awareness()
        try:
            import mss
        except ImportError as exc:  # pragma: no cover
            raise ImportError("mss is required for capture: pip install mss") from exc
        self._sct = mss.mss()
        monitor = self._sct.monitors[config.monitor_index]
        self.region = {
            "left": monitor["left"] + config.capture_left,
            "top": monitor["top"] + config.capture_top,
            "width": config.capture_width,
            "height": config.capture_height,
        }

    def grab_raw(self) -> np.ndarray:
        """One BGRA frame of the configured region (full capture resolution)."""
        shot = self._sct.grab(self.region)
        return np.asarray(shot)

    def grab(self) -> tuple[np.ndarray, np.ndarray]:
        """(raw BGRA full-size frame, preprocessed uint8 small frame)."""
        raw = self.grab_raw()
        return raw, preprocess_frame(raw, self.config)

    def close(self) -> None:
        self._sct.close()
