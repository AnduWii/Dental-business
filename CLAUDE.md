# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **single-file**, **client-side-only** YouTube Shorts analytics dashboard. The entire
application — HTML, CSS, and vanilla JavaScript — lives in
[`youtube-shorts-dashboard.html`](./youtube-shorts-dashboard.html). There is **no backend,
no build step, no package manager, and no test framework**. `README.md` is the user-facing
documentation and mirrors the in-app "Setup & Info" tab.

When editing, keep it a single self-contained file: no external modules, no bundler, no
new build tooling. The only runtime dependencies are two CDN scripts (Google Identity
Services and Chart.js) loaded in `<head>`.

## Running & checking

```bash
# Serve locally — OAuth requires http/https, NOT file://
python3 -m http.server 8000
# open http://localhost:8000/youtube-shorts-dashboard.html
```

OAuth will not work until `CONFIG.CLIENT_ID` is set (placeholder is
`PASTE_YOUR_CLIENT_ID_HERE`) **and** the serving origin is added to the OAuth client's
Authorized JavaScript origins in Google Cloud. To explore without credentials, use the
**"Explore with sample data"** button (demo mode).

There are no automated tests. To sanity-check a change, syntax-check the inline script by
extracting the `<script>` block that begins with `"use strict";` and running it through
`node --check`.

## Code architecture

The inline `<script>` is divided into numbered `SECTION` comment blocks. Preserve this
organization when adding code:

- **SECTION 0 · CONFIGURATION** — `CONFIG` object. All tunables live here: `CLIENT_ID`,
  read-only `SCOPES`, `SHORTS_MAX_SECONDS` (Shorts heuristic), `MAX_VIDEOS`,
  `GROWTH_TAU_DAYS`/`BASE_RATE_MIN_AGE`/`MILESTONES` (forecast model), API base URLs.
- **SECTION 1 · APP STATE** — single `state` object (token, channel, `shorts[]`,
  `dailySeries`, `medians`, caches, `charts` registry, `demo` flag). All app data flows
  through here.
- **SECTION 3 · AUTH** — Google Identity Services token (implicit) flow. The access token
  is held **in memory only** by design (never localStorage/cookies) — do not change this.
  No refresh token exists; a 401 means re-auth.
- **SECTION 4 · API LAYER** — `apiGet()` (Bearer-token fetch with 401/403 handling) plus
  `dataUrl()`/`analyticsUrl()` builders. Two distinct Google APIs are used: **YouTube Data
  API v3** (channel/video metadata + public stats) and **YouTube Analytics API v2**
  (`reports` endpoint: watch time, retention, daily time-series).
- **SECTION 5 · ORCHESTRATION** — `loadEverything()` is the main pipeline: fetch channel →
  list uploads → batch video details → **classify Shorts by duration** (`≤
  CONFIG.SHORTS_MAX_SECONDS`; the API has no reliable is-Short field) → fetch channel daily
  analytics → `processData()` computes per-Short derived metrics, channel medians, ranks,
  and health.
- **SECTION 6 · ANALYTICS MODELS** — the statistical core: `healthScore` (logistic of
  log-ratio vs channel median), `bestTimeAnalysis` (views/day bucketed by local weekday ×
  hour), `forecast` (saturating curve `V∞·(1−e^(−t/τ))` + log-normal milestone
  probabilities), `baseRates`, `factorsFor`. If you change a formula here, update the
  in-app **Methodology** `<details>` block and README §7 to match.
- **SECTION 7 · DEMO DATA** — `loadDemo()` generates deterministic synthetic data via a
  seeded RNG. New data fields must be added here too, in the same shape the API produces,
  or demo mode breaks.
- **SECTION 8–10 · UI / CHARTS / MODAL** — render functions read from `state`. Per-video
  growth curves and retention are fetched lazily and cached (`state.curveCache`,
  `state.retentionCache`); these fetchers branch on `state.demo`.
- **SECTION 11 · VIEW ROUTER** — `showView()` toggles `#view-*` sections, syncs nav, and
  re-renders charts that need a visible canvas. Theme is CSS-variable based
  (`data-theme` attr); charts re-render on theme switch to pick up new colors.

## Gotchas

- **Chart.js colors:** canvas `fillStyle` does **not** understand CSS `color-mix()`. Use
  the `hexToRgba()` helper for any chart fill/border derived from a CSS variable.
- **Chart lifecycle:** always create charts via `makeChart(key, canvasId, cfg)`, which
  destroys the prior instance under that key. Recreating a chart on an existing canvas
  without destroying leaks/errors.
- **Adding a tab:** add a `data-view` nav button, a matching `id="view-<name>"` section,
  and (if it draws charts) a re-render branch in `showView()`.
- **Read-only scope only:** never add write or monetary (`yt-analytics-monetary.readonly`)
  scopes. The Revenue section is intentionally educational/links-only — it must not connect
  to any financial system.
