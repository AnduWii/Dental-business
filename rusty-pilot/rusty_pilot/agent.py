"""The live player: capture -> (task engine | learned policy) -> key presses.

Runs the exported .onnx model through onnxruntime (torch not needed at play time).
Desktop/Windows only. Press the kill-switch key (F8 by default) to stop instantly;
alt-tabbing away from Roblox also releases every key.
"""

from __future__ import annotations

import time
from collections import deque
from pathlib import Path

import numpy as np

from .actions import decode_vector, sigmoid
from .capture import frames_to_model_input
from .config import Config
from .export import read_sidecar
from .tasks.engine import ActiveScript, TaskEngine

TASK_CHECK_INTERVAL = 0.5  # seconds between template sweeps (they cost ~ms each)


def validate_model_compat(sidecar: dict, config: Config) -> None:
    """Refuse to drive the game with a model whose geometry/keys mismatch the config."""
    problems = []
    if tuple(sidecar["action_keys"]) != tuple(config.action_keys):
        problems.append(
            f"model keys {sidecar['action_keys']} != config keys {list(config.action_keys)}"
        )
    for field in ("frame_stack", "frame_width", "frame_height"):
        if int(sidecar[field]) != int(getattr(config, field)):
            problems.append(
                f"model {field}={sidecar[field]} != config {field}={getattr(config, field)}"
            )
    # capture_fps changes what a frame stack MEANS in time, so a model trained at
    # one rate misbehaves at another. .get(): sidecars predate this field.
    fps = sidecar.get("capture_fps")
    if fps is not None and int(fps) != int(config.capture_fps):
        problems.append(f"model capture_fps={fps} != config capture_fps={config.capture_fps}")
    if problems:
        raise ValueError("model/config mismatch: " + "; ".join(problems))


def validate_task_keys(engine: TaskEngine, config: Config) -> None:
    for rule in engine.rules:
        for step in rule.script:
            unknown = set(step.keys) - set(config.action_keys)
            if unknown:
                raise ValueError(
                    f"task '{rule.name}' uses keys {sorted(unknown)} that are not in "
                    f"config.action_keys {list(config.action_keys)}"
                )


class Agent:
    def __init__(self, config: Config, model_path: str | Path):
        import onnxruntime as ort

        self.config = config
        sidecar = read_sidecar(model_path)
        validate_model_compat(sidecar, config)
        self.session = ort.InferenceSession(
            str(model_path), providers=["CPUExecutionProvider"]
        )
        self.frame_buffer: deque[np.ndarray] = deque(maxlen=config.frame_stack)
        self._stop = False

        tasks_file = Path(config.tasks_file)
        if tasks_file.exists():
            self.engine: TaskEngine | None = TaskEngine.from_file(
                tasks_file, config.templates_dir
            )
            validate_task_keys(self.engine, config)
            if self.engine.missing:
                print(
                    "tasks with no calibrated template yet (inactive): "
                    + ", ".join(self.engine.missing)
                )
        else:
            self.engine = None
            print(f"no {tasks_file} found; running with the learned policy only")

    # ------------------------------------------------------------------
    def policy_keys(self) -> set[str]:
        """One model inference over the current frame stack."""
        stacked = np.stack(self.frame_buffer)
        (logits,) = self.session.run(
            ["logits"], {"frames": frames_to_model_input(stacked)}
        )
        probs = sigmoid(logits[0])
        return decode_vector(probs, self.config.action_keys, self.config.action_threshold)

    def _start_kill_listener(self):
        try:
            from pynput import keyboard
        except ImportError as exc:  # pragma: no cover
            raise ImportError("pynput is required for the kill switch: pip install pynput") from exc

        from .recorder import normalize_key

        kill = self.config.kill_switch_key.lower()

        def on_press(key):
            if normalize_key(key) == kill:
                self._stop = True

        listener = keyboard.Listener(on_press=on_press)
        listener.start()
        return listener

    def run(self) -> None:
        from .capture import ScreenGrabber  # local imports: need a display / Windows
        from .controls import GameController

        grabber = ScreenGrabber(self.config)
        controller = GameController(self.config)
        listener = self._start_kill_listener()
        interval = 1.0 / self.config.capture_fps
        active: ActiveScript | None = None
        last_task_check = float("-inf")

        print(
            f"agent starting in 3 seconds. Focus the Roblox window now. "
            f"Kill switch: {self.config.kill_switch_key.upper()}"
        )
        time.sleep(3.0)
        try:
            next_tick = time.perf_counter()
            while not self._stop:
                raw, small = grabber.grab()
                self.frame_buffer.append(small)
                now = time.perf_counter()

                if active is not None:
                    keys = active.keys_at(now)
                    if keys is None:
                        print(f"task script '{active.rule_name}' finished")
                        active = None
                if active is None and self.engine is not None and (
                    now - last_task_check >= TASK_CHECK_INTERVAL
                ):
                    last_task_check = now
                    import cv2

                    gray_full = cv2.cvtColor(np.asarray(raw), cv2.COLOR_BGRA2GRAY)
                    active = self.engine.check(gray_full, now)
                    if active is not None:
                        print(f"task cue detected: running '{active.rule_name}'")
                        if active.match_center is not None:
                            # Aim the cursor at the cue so m1 steps click on it.
                            # match_center is in capture-frame pixels; add the
                            # capture region's screen offset.
                            cx, cy = active.match_center
                            controller.move_to(
                                grabber.region["left"] + cx,
                                grabber.region["top"] + cy,
                            )

                if active is not None:
                    target = active.keys_at(now) or set()
                elif len(self.frame_buffer) == self.config.frame_stack:
                    target = self.policy_keys()
                else:
                    target = set()  # still warming up the frame stack
                controller.apply(target)

                next_tick += interval
                delay = next_tick - time.perf_counter()
                if delay > 0:
                    time.sleep(delay)
                else:
                    next_tick = time.perf_counter()
        finally:
            controller.panic()
            listener.stop()
            grabber.close()
            print("agent stopped; all keys released")
