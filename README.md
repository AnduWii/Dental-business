# YouTube Shorts Analytics Dashboard

A **single-file** (HTML + CSS + JavaScript), **client-side-only** personal dashboard
for understanding your YouTube **Shorts** performance. It signs in with Google's
official OAuth flow and reads *your own* channel data through the **YouTube Data API v3**
and **YouTube Analytics API v2**.

> Everything runs in your browser. **No backend.** Your access token lives only in
> page memory (never written to disk or sent to any server other than Google's APIs).
> Scopes are **read-only** and there is **no financial/monetary access**.

📄 **The app:** [`youtube-shorts-dashboard.html`](./youtube-shorts-dashboard.html)
(open the file's top comment + the in-app **Setup & Info** tab for the full reference.)

---

## Features

| Area | What it shows |
|---|---|
| **Channel dashboard** | Subscribers, total views, lifetime watch time, Shorts analysed, avg views/Short, avg engagement, view velocity, daily growth & watch-time trends |
| **Shorts analytics** | Per-Short views, likes, comments, engagement rate, upload date, daily growth curve, relative performance vs channel median, ranking, retention (when available) |
| **Best time to post** | Best day / hour / day×hour slot from your history, with confidence levels, sample sizes, and a day×hour heatmap |
| **Growth forecasting** | Statistical probability of reaching 1K / 10K / 100K / 1M views, estimated lifetime trajectory, channel base rates, helping/hurting factors |
| **Video health score** | 0–100 score from engagement, like/view, comment rate, growth speed, retention — each relative to your channel median, with explanations |
| **Revenue (educational)** | YPP requirements, ad-revenue basics, sponsorships, affiliate, merch, memberships — links to official resources only |
| **UI** | Modern dashboard, mobile-responsive, dark/light mode, interactive Chart.js charts, sample-data mode (no login needed to explore) |

---

## 1 · Setup instructions

1. Create a project at **[Google Cloud Console](https://console.cloud.google.com/)**.
2. **APIs & Services → Library** → enable **YouTube Data API v3** and **YouTube Analytics API**.
3. **OAuth consent screen** → *External* → add yourself under **Test users**.
   Add scopes `youtube.readonly` and `yt-analytics.readonly`.
4. **Credentials → Create credentials → OAuth client ID** → *Web application*.
   Under **Authorized JavaScript origins** add the exact origin you'll serve from
   (e.g. `http://localhost:8000`) — no path, no trailing slash. Copy the **Client ID**.
5. *(Optional)* Create an **API key** — not required (OAuth token authorizes all calls).
6. Open `youtube-shorts-dashboard.html`, find `PASTE_YOUR_CLIENT_ID_HERE` in the
   `CONFIG` block, and paste your Client ID.
7. Serve over http/https (**not** `file://`):
   ```bash
   python3 -m http.server 8000
   # then open http://localhost:8000/youtube-shorts-dashboard.html
   ```
8. Click **Sign in with Google**, grant read-only access — your data loads.

> Want to see the UI first? Click **"Explore with sample data"** (no login).

## 2 · Security considerations

- **Read-only scopes only** — cannot modify, upload, delete, or post.
- **No financial scope** — `yt-analytics-monetary.readonly` is intentionally *not*
  requested. The Revenue tab is purely educational; the app never touches banks,
  payment processors, or financial accounts.
- **Token in memory only** — never persisted to localStorage/cookies/servers.
  Closing the tab discards it; **Sign out** revokes it with Google.
- **Implicit (token) flow** — no client-side refresh token; tokens expire (~1h), then
  re-auth. Silent refresh requires a backend (authorization-code flow).
- **Client ID is public-safe** — restricted by your Authorized JavaScript origins.
  Never put a client *secret* in client code.
- **Third-party CDNs** — Google GSI + Chart.js. Self-host and add Subresource
  Integrity for a stricter supply chain.

## 3 · API limitations

- **Quota** — Data API default 10,000 units/day. This app uses only a few units per
  refresh, but heavy use can hit the cap.
- **Analytics latency** — data is delayed ~2–3 days; the most recent 1–2 days are often
  incomplete.
- **Shorts detection** — there is **no reliable is-Short field** in the API, so a video
  is classified as a Short by duration (`≤ 60s` by default, editable in `CONFIG`).
  Edge cases can be misclassified.
- **Privacy thresholds** — some Analytics dimensions (e.g. demographics) are withheld
  below minimum view thresholds.
- **Pagination cap** — loads up to `CONFIG.MAX_VIDEOS` recent uploads to stay fast and
  within quota.

## 4 · Honest limitations — what the data can & cannot tell you

- **Best time to post is correlational, not causal.** We only know each video's publish
  time and accumulated performance — not a controlled experiment. Small samples are noisy.
- **Forecasts are statistical estimates, not predictions.** Virality depends on the
  recommendation system, which no API exposes. Probabilities come from *your own* history
  plus a simple growth-decay model and are shown with explicit confidence levels.
- **"Audience activity"** here is inferred from your publish/performance history, not
  real-time viewer presence (unavailable via the public API).
- **Retention** is limited to `averageViewPercentage` / `averageViewDuration`;
  frame-by-frame retention graphs live in Studio, not the public API.
- **Health score is relative** to your own channel medians — not an absolute quality
  verdict or a Studio metric.

## 5 · Features that would require a backend server

- Silent token refresh (OAuth authorization-code flow with server-side refresh token).
- Scheduled snapshots / true longitudinal history (cron jobs storing daily metrics).
- Real ML forecasting trained across many videos/channels, served from an API.
- Quota pooling & caching for multiple users; hiding secrets; rate-limit protection.
- Email/push alerts ("a Short is overperforming"), exports, multi-channel comparison.
- Webhooks / PubSubHubbub for near-real-time new-upload notifications.

## 6 · Future upgrade recommendations

- Pull traffic sources, impressions & CTR (where available), and audience geography for
  deeper "best time" and targeting insight.
- Replace the heuristic Shorts filter with a confirmed/labeled list.
- Persist time-series locally (IndexedDB) to build real per-video history across sessions.
- A/B-style comparisons of titles/thumbnails; tag experiments.
- Backend ML (e.g. survival/hazard models) for milestone probabilities, calibrated to outcomes.
- CSV/PDF export and a shareable read-only "media kit" view for sponsorships.
- Subresource Integrity + self-hosted libraries; optional PKCE auth-code flow via a tiny
  serverless function.

## 7 · Methodology (transparency)

- **View velocity** = lifetime views ÷ age in days (and ÷24 for per-hour).
- **Best time** — each Short's views/day is bucketed by local publish weekday & hour;
  averaged per bucket and ranked. Confidence scales with sample count.
- **Forecast** — cumulative views modeled as `V∞·(1 − e^(−t/τ))` (τ ≈ 7 days). From a
  Short's current views at age *t* we estimate lifetime `V∞`, then model the final outcome
  as log-normal (σ from your channel's view spread, widened for very young videos) to get
  `P(final ≥ milestone)`. Reached milestones are 100%.
- **Health score** — weighted blend of engagement rate, like/view, comment/view,
  views/day, and retention; each scored by a logistic of its log-ratio to your channel
  median (median ⇒ 50).
- **Base rates** — share of your Shorts older than 14 days that crossed each milestone.

---

*Built as a personal analytics tool. Not affiliated with or endorsed by YouTube/Google.
Always verify current YouTube Partner Program thresholds and policies on official pages.*
