"""Rusty Pilot CLI. Run from the rusty-pilot folder:

    python -m rusty_pilot init         write config.json + tasks.json defaults
    python -m rusty_pilot check        verify installation and environment
    python -m rusty_pilot calibrate    capture screenshots to crop task templates from
    python -m rusty_pilot record       record YOUR play as training data (F8 stops)
    python -m rusty_pilot train        train on recordings, export models/policy.onnx
    python -m rusty_pilot smoke        prove the pipeline end to end on synthetic data
    python -m rusty_pilot play         drive the game with the trained model (F8 stops)
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

# No numpy/cv2/torch imports at module level: the CLI must start on a half-installed
# machine so `check` can say what is missing instead of dying with a traceback.


def cmd_init(args) -> int:
    from .config import Config
    from .tasks.library import write_default_tasks_file

    config = Config()
    wrote_config = not Path("config.json").exists()
    if wrote_config:
        config.save("config.json")
    wrote_tasks = write_default_tasks_file(config.tasks_file)
    print(f"config.json {'written' if wrote_config else 'already exists, kept'}")
    print(f"{config.tasks_file} {'written' if wrote_tasks else 'already exists, kept'}")
    print("next: python -m rusty_pilot check")
    return 0


def cmd_check(args) -> int:
    """Report what is installed/missing instead of failing mid-run later."""
    problems = 0
    for module, why, needed_for in [
        ("numpy", "arrays", "everything"),
        ("cv2", "image ops (pip install opencv-python)", "everything"),
        ("mss", "screen capture", "calibrate/record/play"),
        ("pynput", "key recording + kill switch", "record/play"),
        ("torch", "training (CPU build is fine)", "train"),
        ("onnxruntime", "running the exported model", "play"),
        ("pydirectinput", "sending input (pip install pydirectinput-rgx)", "play"),
        ("pygetwindow", "window focus guard", "play"),
    ]:
        try:
            __import__(module)
            print(f"  ok       {module}")
        except ImportError:
            print(f"  MISSING  {module}: {why} (needed for: {needed_for})")
            problems += 1
    if sys.platform != "win32":
        print(
            "  note     not Windows: record/play cannot drive Roblox here; "
            "train/smoke still work"
        )
    try:
        from .config import Config

        config = Config.load_or_default(args.config)
    except Exception as exc:
        print(f"  BROKEN   cannot load config: {exc}")
        problems += 1
        config = None

    if config is not None:
        try:
            # These need cv2/numpy; the probe loop above already counted them if
            # missing, so an ImportError here is a note, not another problem.
            from .agent import validate_task_keys
            from .tasks.engine import TaskEngine
        except ImportError:
            print("  note     tasks.json check skipped until the modules above are installed")
        else:
            tasks_file = Path(config.tasks_file)
            if tasks_file.exists():
                try:
                    engine = TaskEngine.from_file(tasks_file, config.templates_dir)
                    validate_task_keys(engine, config)
                    ready = [r.name for r in engine.active_rules]
                    print(
                        f"  tasks    {len(ready)} with templates: {', '.join(ready) or 'none yet'}"
                    )
                    if engine.missing:
                        print(f"           awaiting templates: {', '.join(engine.missing)}")
                except Exception as exc:
                    print(f"  BROKEN   {tasks_file}: {exc}")
                    problems += 1
            else:
                print(f"  note     no {tasks_file} yet; run: python -m rusty_pilot init")
    print("all good" if problems == 0 else f"{problems} problem(s) to fix")
    return 0 if problems == 0 else 1


def cmd_calibrate(args) -> int:
    from .calibrate import calibrate
    from .config import Config

    calibrate(Config.load_or_default(args.config), args.shots, args.delay)
    return 0


def cmd_record(args) -> int:
    from .config import Config
    from .recorder import Recorder

    config = Config.load_or_default(args.config)
    session_name = time.strftime("%Y%m%d_%H%M%S")
    Recorder(config, session_name).run()
    return 0


def cmd_train(args) -> int:
    from .config import Config
    from .train import train

    train(Config.load_or_default(args.config), out_name=args.name)
    return 0


def cmd_smoke(args) -> int:
    from .smoke import run_smoke

    run_smoke()
    return 0


def cmd_play(args) -> int:
    from .agent import Agent
    from .config import Config

    config = Config.load_or_default(args.config)
    model = args.model or f"{config.models_dir}/policy.onnx"
    Agent(config, model).run()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="rusty_pilot", description=__doc__)
    parser.add_argument("--config", default=None, help="path to config.json")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="write default config.json and tasks.json")
    sub.add_parser("check", help="verify installation and configuration")
    p = sub.add_parser("calibrate", help="capture screenshots for task templates")
    p.add_argument("--shots", type=int, default=8)
    p.add_argument("--delay", type=float, default=10.0)
    sub.add_parser("record", help="record your gameplay as training data")
    p = sub.add_parser("train", help="train the policy and export ONNX")
    p.add_argument("--name", default="policy", help="output model name")
    sub.add_parser("smoke", help="synthetic end-to-end pipeline test")
    p = sub.add_parser("play", help="let the trained model play (F8 stops)")
    p.add_argument("--model", default=None, help="path to a .onnx model")

    args = parser.parse_args(argv)
    handler = {
        "init": cmd_init,
        "check": cmd_check,
        "calibrate": cmd_calibrate,
        "record": cmd_record,
        "train": cmd_train,
        "smoke": cmd_smoke,
        "play": cmd_play,
    }[args.command]
    return handler(args)


if __name__ == "__main__":
    raise SystemExit(main())
