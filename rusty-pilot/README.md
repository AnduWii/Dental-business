# Rusty Pilot

A record, train, export, play imitation-learning kit that learns to play the Roblox
game **Rusty Plane** from your own gameplay, then drives the game with WASD and the
mouse through a small neural network you train on your PC.

How it plays, two brains working together:

- **The learned policy** (a CNN you train) watches the screen 10 times a second and
  decides which keys to hold: `w a s d space e`, left click, and `1` to equip your
  tool. It learns movement and habits purely from recordings of you playing.
- **The task engine** (`tasks.json`) watches the full-resolution screen for cues you
  calibrated (a leaking pipe, a broken light, the refuel prompt) and, when one
  appears, runs a reliable scripted interaction (hold E, click the bulbs, swing the
  mop), then hands control back to the policy.

The trained model is exported to **`models/policy.onnx`**, a single portable file
you can copy, back up, and share between machines. That file is the downloadable
model; `models/policy.json` beside it carries its settings and must travel with it.

## Read this first

- **This kit ships untrained.** It cannot play anything until you record your own
  gameplay and train it. That process is `docs/TRAINING.md`, follow it top to bottom.
- **Automation is against Roblox's Terms of Use.** Roblox can action accounts that
  use input automation, and its anti-cheat evolves. This kit does nothing sneaky
  (no memory reading, no exploits, it only captures the screen and sends ordinary
  keystrokes), but the account risk is yours. Use a throwaway account, keep runs
  supervised, and treat this as a learning project.
- **Windows only for record/calibrate/play** (Roblox + DirectInput). Training and
  the smoke test run anywhere with Python.
- **Kill switch: F8.** Pressing it instantly stops recording or playback and
  releases every key. Alt-tabbing away from Roblox also releases everything; the
  agent refuses to send input unless the Roblox window is focused.

## Install (Windows, no GPU needed)

Install Python 3.11 or 3.12 from python.org (check "Add python.exe to PATH"), then
in a terminal, from this `rusty-pilot` folder:

```
py -m pip install --upgrade pip
py -m pip install torch --index-url https://download.pytorch.org/whl/cpu
py -m pip install -r requirements.txt
py -m rusty_pilot init
py -m rusty_pilot check
```

`check` tells you exactly what is missing, if anything. Then prove the whole
pipeline on your machine before touching the game:

```
py -m rusty_pilot smoke
```

That generates fake gameplay, trains a real model on it, exports ONNX, and runs it
through onnxruntime. If it prints "smoke test passed", every seam works.

## The five commands you will actually use

| Command | What it does |
| --- | --- |
| `py -m rusty_pilot calibrate` | Screenshots your screen so you can crop task-cue templates |
| `py -m rusty_pilot record` | Records your play (screen + keys) as training data. F8 stops |
| `py -m rusty_pilot train` | Trains on all recordings, exports `models/policy.onnx` |
| `py -m rusty_pilot play` | Lets the trained model play. F8 stops | 
| `py -m rusty_pilot check` | Diagnoses your setup |

Full walkthrough with settings, data targets, and troubleshooting:
[`docs/TRAINING.md`](docs/TRAINING.md).

## What is honestly in and out of scope

Works today: WASD movement cloned from your play, jump, interact, tool equip and
clicks, plus scripted reactions to any visual cue you calibrate (welding pipes,
patching holes, bulb clicks, window nails, mopping, refueling, oxygen pumping).

Known limits, by design of v1:

- Camera control is not modeled. Play and record in **first person or shift-lock**
  so the camera follows the mouse consistently and WASD always means the same thing.
- The wire color-matching minigame needs decisions (click matching colors), not a
  fixed script. The policy can learn it from many demonstrations, but do not expect
  reliability there early on.
- Audio cues (missile alarms, bird caws) are invisible to a screen-only agent.
- It learns YOUR screen: changing resolution, graphics quality, or UI scale after
  recording or calibrating degrades everything. Pick settings once, keep them.

## Layout

```
rusty_pilot/            the package (config, capture, controls, recorder, dataset,
                        model, train, export, agent, calibrate, smoke)
rusty_pilot/tasks/      task engine + default Rusty Plane task set
tests/                  32 tests, including a full synthetic train->export->infer run
docs/TRAINING.md        the step-by-step training guide
```

Everything that touches the screen, keyboard, or Windows is imported lazily, so the
dataset/model/training/task-engine logic runs and is tested on any OS.
