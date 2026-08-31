# Training Rusty Pilot yourself, step by step

You are the teacher. The model becomes a copy of how YOU play Rusty Plane, so the
quality of what you record is the ceiling of what it learns. Budget your first
session like this: 10 minutes of setup, 15 minutes of calibration, then recording
in chunks whenever you play.

Everything below runs from the `rusty-pilot` folder in a terminal
(`cd` into it first). `py` is the Windows Python launcher; if `py` is not found,
use `python` instead.

## Step 0: install and self-check

Follow the install block in [`README.md`](../README.md), then:

```
py -m rusty_pilot init
py -m rusty_pilot check
py -m rusty_pilot smoke
```

`init` writes two files you will edit later: `config.json` (screen region, keys,
training settings) and `tasks.json` (the scripted task reactions). `smoke` must
print "smoke test passed" before you go further; it proves training and export
work on your machine without the game.

## Step 1: lock in your game settings

The agent sees raw pixels, so consistency beats everything:

1. Run Roblox **windowed borderless or fullscreen at your normal resolution** and
   never change resolution or graphics quality again (re-record and re-calibrate
   if you do).
2. If your Windows display scale is not 100%, that is fine (the kit declares DPI
   awareness), just never change it mid-project.
3. Play in **first person or shift-lock** (default shift-lock toggle: Shift).
   The model does not move the camera, so the camera must follow the mouse and
   WASD must always mean the same thing on screen.
4. If your monitor is not 1920x1080, edit `capture_width` / `capture_height` in
   `config.json` to your resolution now, before recording anything.

## Step 2: calibrate the task cues

The task engine reacts to small images ("templates") cropped from YOUR screen.

1. Get into a Rusty Plane round. When a task is clearly visible on screen (a
   leaking pipe, a broken light panel, the refuel prompt), run:

   ```
   py -m rusty_pilot calibrate --shots 8 --delay 10
   ```

   Alt-tab back to the game and pose each cue before each 10-second countdown
   ends. Full screenshots land in `templates/raw/`.
2. Open each screenshot in any image editor (Paint works). Crop **tightly** around
   the distinctive part of each cue, the smaller and more unique the better (an
   icon, a prompt, the broken-object look). Avoid including background that
   changes.
3. Save the crops as PNGs into `templates/` with exactly these names (they match
   `tasks.json`):

   | Template file | Cue it should show |
   | --- | --- |
   | `weld_pipe.png` | leaking/burning fuel pipe |
   | `patch_hole.png` | hull hole prompt |
   | `fix_lights.png` | broken light / bulb panel |
   | `fix_window.png` | hail-broken window |
   | `mop_puddle.png` | fuel puddle |
   | `refuel.png` | jerry-can refuel prompt |
   | `pump_oxygen.png` | the bike pump station |

4. `py -m rusty_pilot check` now lists which tasks are armed. Tasks without a
   template stay dormant; you can start with just two or three.

Tune later in `tasks.json`: `threshold` (raise toward 0.9 if a task false-fires,
lower toward 0.75 if it never fires), `seconds` on script steps (how long E is
held, how many clicks), and order (earlier = higher priority).

## Step 3: record your gameplay

```
py -m rusty_pilot record
```

Then just play Rusty Plane well. The recorder grabs the screen and your held keys
10 times a second and saves them under `data/session_*/`. Press **F8** when done.

What makes good training data:

- **Volume**: aim for 30 to 60 minutes total before the first serious training
  run (that is 18k to 36k frames). More varied data beats more epochs.
- **Variety**: different rounds, different tools, different failures. Record
  walking to tasks, doing tasks, and idling near the crew, in realistic mixture.
- **Cleanliness**: the recorder captures everything, including you alt-tabbing or
  standing in menus. Record in focused chunks and stop (F8) between rounds. To
  discard a bad session, delete its `data/session_*` folder.
- **Consistency**: same character, same shift-lock mode, same resolution.

## Step 4: train

```
py -m rusty_pilot train
```

CPU is fine: expect a few minutes per 10k frames with the default 12 epochs. You
get a per-epoch report like:

```
epoch   5  train 0.31  val 0.29  per-key acc 0.93  <- best, saved
```

- `per-key acc` is how often the model predicts your exact key states on held-out
  frames. Above ~0.9 it has learned your movement habits; below ~0.8, record more
  and more varied data.
- The best epoch (lowest validation loss) is what gets exported, so overtraining
  is not dangerous, just slow.
- Output: **`models/policy.onnx`** plus `models/policy.pt` (the raw checkpoint)
  and `models/policy.json` (settings sidecar). The `.onnx` + `.json` pair is your
  downloadable, portable model. Copy those two files anywhere; `play --model
  path\to\policy.onnx` runs them.

Settings in `config.json` if you want to experiment: `epochs`, `batch_size`,
`learning_rate`, `frame_stack` (how many past frames the model sees; retrain from
scratch if you change it, and re-record nothing).

## Step 5: let it play, supervised

1. Join a Rusty Plane round.
2. Run `py -m rusty_pilot play`, then focus the Roblox window within 3 seconds.
3. Watch it. **F8 stops everything instantly**; alt-tabbing also cuts input.

The console narrates task-engine takeovers ("task cue detected: running
'weld_pipe'"). Everything between those lines is the learned policy.

Expected progression, so you are not surprised:

- **After 30 to 60 min of data**: it walks around plausibly, follows your common
  routes, presses E near things sometimes, and armed task scripts fire when cues
  are visible. It will still do dumb things regularly.
- **After several hours of varied data**: noticeably fewer dumb things. This is
  roughly the practical ceiling of straight behavioral cloning.
- It will never handle what you never showed it, and it cannot hear alarms.

## Improving it: the loop

1. Watch it play and note the worst failure (gets stuck in a corner, ignores
   fires, never refuels).
2. Record 10 to 15 more minutes demonstrating exactly that situation, repeatedly.
3. Retrain (`py -m rusty_pilot train`), play again, compare.
4. For task-engine misses, fix the template or threshold instead of retraining.

Keep model versions by training under different names:
`py -m rusty_pilot train --name policy_v2`, then
`py -m rusty_pilot play --model models/policy_v2.onnx`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `check` says pydirectinput missing | `py -m pip install pydirectinput-rgx` |
| Keys do nothing in game | Roblox window must be focused; check `game_window_title` is `Roblox`; do not run Roblox as administrator |
| Character walks forever after F8 | Should not happen (panic releases keys); if Roblox lost the release because you alt-tabbed at that instant, tap the stuck key once |
| Task never fires | Re-crop the template tighter, lower its `threshold`, confirm the file name matches `tasks.json` |
| Task fires constantly on nothing | Raise `threshold` toward 0.9, or crop a more distinctive template |
| Train says "no usable shards" | You have no recordings under `data/`; run `record` first |
| Model plays worse after adding data | A session was junk (menus, AFK); delete that `data/session_*` and retrain |
| Play refuses to start: model/config mismatch | The model was trained under different `action_keys`/frame settings; retrain, or point `--model` at the matching file |

## Sources for the Rusty Plane specifics

Task list and mechanics referenced from the game's wiki and store page:
the [Rusty Plane game page](https://www.roblox.com/games/84726337419858/Rusty-Plane),
the [Rusty Plane wiki tutorial](https://rusty-plane.fandom.com/wiki/Tutorial), and
the [classes page](https://rusty-plane.fandom.com/wiki/Classes). The wiki documents
the tasks (tape for holes, torch held on pipes, bulb/wire minigames for lights,
hammer-and-nails for windows, jerry cans, the rear bike pump for oxygen) but not
exact hold durations or on-screen prompt art, which is why calibration and the
`seconds` values in `tasks.json` are yours to tune.
