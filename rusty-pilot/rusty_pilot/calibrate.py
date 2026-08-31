"""Template calibration: capture reference screenshots of Rusty Plane's task cues.

The task engine can only recognize what YOUR screen shows at YOUR resolution and
graphics settings, so templates are captured on your machine, not shipped. Flow:

1. `python -m rusty_pilot calibrate` starts a countdown loop.
2. In the game, stand so a task cue (prompt/broken object) is clearly on screen.
3. Each countdown tick saves a full screenshot into templates/raw/.
4. Afterwards, open the screenshots in any image editor, crop TIGHTLY around the
   distinctive cue (small and distinctive beats big and generic), and save the
   crops as the PNG names in tasks.json: weld_pipe.png, patch_hole.png,
   fix_lights.png, fix_window.png, mop_puddle.png, refuel.png, pump_oxygen.png.

Re-calibrate whenever you change resolution or graphics settings.
"""

from __future__ import annotations

import time
from pathlib import Path

import cv2

from .config import Config


def calibrate(config: Config, shots: int, delay_seconds: float) -> None:
    from .capture import ScreenGrabber  # needs a display

    raw_dir = Path(config.templates_dir) / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    grabber = ScreenGrabber(config)
    print(
        f"taking {shots} screenshots, one every {delay_seconds:.0f}s. Switch to the "
        "game and line up a task cue before each shot."
    )
    try:
        for i in range(1, shots + 1):
            for remaining in range(int(delay_seconds), 0, -1):
                print(f"  shot {i}/{shots} in {remaining}s...", end="\r", flush=True)
                time.sleep(1)
            raw = grabber.grab_raw()
            path = raw_dir / f"shot_{i:02d}.png"
            cv2.imwrite(str(path), cv2.cvtColor(raw, cv2.COLOR_BGRA2BGR))
            print(f"  saved {path}                    ")
    finally:
        grabber.close()
    print(
        f"\ndone. Now crop each cue tightly and save into {config.templates_dir}/ "
        "using the file names from tasks.json (see docs/TRAINING.md, step 2, item 3)."
    )
