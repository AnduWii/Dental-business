# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Catchline**, missed-call recovery for dental clinics. When a clinic misses a call, Catchline texts the caller
> back, runs a short AI intake (name, reason, urgency, booking intent), logs it, and pages the
> front desk. Full docs in [`README.md`](README.md) and [`docs/`](docs/).

This file is the at-a-glance status + the **"before first paying clinic"** checklist. If you're a
new session: read this, then `README.md` and `docs/`.

> **Writing-style rule (applies to all site copy, SMS, and docs): never use em dashes.** Use commas,
> periods, or parentheses instead. The AI intake prompt enforces this too. Keep the repo at zero
> em dashes.
>
> **Design-system rule (applies to all UI): follow [`docs/15-design-system.md`](docs/15-design-system.md).**
> Steel-blue accent on a near-monochrome base, Young Serif headings + Public Sans body + Fragment
> Mono micro-labels, `rounded-md`
> for primary buttons, `shadow-sm` max (no blur or glow), zero emojis in the UI, 150ms hover fades,
> scroll reveals only per the rules in docs/15, no trailing periods on display headings, no
> AI-slop phrasing, and **never sets of three**
> (no card trios, numbered steps, or icon grids; the owner rejects these on sight).

---

## 🧠 Architecture (the big picture, read before touching code)

**One Next.js 15 App Router codebase on Vercel does everything** (pages + API routes); Supabase
(Postgres + Auth + Realtime, `ca-central-1`) is the only backend service; Twilio provides the
per-clinic phone numbers. `main` auto-deploys straight to production (the branch ruleset is
disabled), so every push to `main` is a deploy.

**The core loop** (all server-side, in two webhook routes):
`Patient calls clinic → carrier conditional-forwarding sends the unanswered call to the clinic's
dedicated Twilio number → POST /api/twilio/voice` logs the missed call, upserts the patient,
opens/reuses a conversation, and sends the instant SMS text-back. The patient's reply hits
`POST /api/twilio/sms`, which handles STOP/START compliance, dedupes Twilio retries (unique
`messages.twilio_sid`), enforces the 20-auto-replies/hour cost cap, runs `runIntake()`
(`src/lib/ai/intake.ts`), stores the reply, updates lead fields on the conversation, and pages
the clinic (`src/lib/notify.ts`: dashboard notification rows + SMS to `clinics.notify_phone`).
**`clinics.twilio_number` is the routing key**: webhooks look up the clinic by the number Twilio
was called/texted on, E.164-exact, one clinic per number, ever.

**Tenancy and auth, three Supabase client flavors** (never mix them up):
- `lib/supabase/server.ts` (anon key + user cookies): Server Components / user-scoped reads,
  enforced by RLS (`profiles.clinic_id` scopes every table).
- `lib/supabase/client.ts` (browser): realtime subscriptions only.
- `lib/supabase/admin.ts` (service role, bypasses RLS): webhooks and server actions, ALWAYS
  behind an explicit guard: `requireClinicMember()` for conversation APIs, `isAdminEmail()`
  allow-list (`lib/constants.ts` + `ADMIN_EMAILS` env) for /admin, Twilio signature validation
  for webhooks. `src/middleware.ts` refreshes sessions and gates dashboard routes; `/api/*` is
  excluded from it by the matcher.

**Degrade-by-env is the house pattern**: no AI key → deterministic scripted intake (tests pin
it); no Stripe keys → billing routes return 503 and the page says "not connected"; Twilio
signature checks enforce only in production; a malformed `NEXT_PUBLIC_APP_URL` can't crash the
build. Features light up when their env vars exist. `NEXT_PUBLIC_APP_URL` must EXACTLY equal the
public URL Twilio calls, or signature validation 403s every webhook.

**Database changes** are hand-applied: write `supabase/migrations/NNNN_*.sql`, run it in the
Supabase SQL editor, and record it in this file (0001 schema+RLS, 0002 audit/retention, 0003
billing NOT YET APPLIED, 0004 audit FK unlink). `audit_log` is append-only via triggers and its
`clinic_id` deliberately has NO foreign key (0004) so clinic deletes don't violate the triggers.
The dashboard is server components + `RealtimeRefresher` (postgres_changes → `router.refresh()`),
not client state.

**Sharp edges that have already cut us once**: Supabase free tier auto-pauses after ~1 week idle
(symptom: 504 `MIDDLEWARE_INVOCATION_TIMEOUT` everywhere and silent webhooks; fix: restore the
project, real fix: Supabase Pro). Vercel deployment-hash URLs (`catchline-xxxxx-*.vercel.app`)
are per-deploy throwaways, never configure anything against them. The demo conversation on the
landing page must never show the AI offering/booking appointment times (Terms consistency).

## ▶ Immediate next steps (where we left off, 2026-10-24)
The platform is LIVE end to end (text + call + AI intake + front-desk page all verified on the
real number). The first pilot clinic, **Emerald Park Dental** (the owner's relative, agreed to a
free 14-day pilot), is configured in the app; only their phone line remains. Playbook:
[`docs/18`](docs/18-clinic-onboarding.md).
1. **Conditional call forwarding on the clinic's Rogers business landline** to +1 (437) 476-9802:
   try `*92` + number (forward on no answer) and `*90` + number (on busy) from the office phone;
   if the codes are rejected, the clinic calls Rogers Business support (611 from the line) and
   asks for both, ~4 rings, triggering before voicemail would answer. Then the ring-out test:
   call their real number, let it ring out, expect the Catchline greeting, the text-back, and the
   front-desk page (docs/18 steps 6-7).
2. **Upgrade Supabase to Pro** before the pilot runs unattended: the free tier auto-paused on
   2026-10-24 and silently killed the whole product (504s + dead webhooks) until restored.
3. On the pilot clinic's record: set **front-desk mobile to the clinic's own cell** (it may still
   be the owner's) and confirm the saved text-back message contains no em dash.
4. Fill the **[mailing address]** placeholder in the Privacy Policy + DPA.

## ✅ Current status (updated 2026-10-24)
- **V1 built and deployed** on Vercel: project **"catchline"** (owned by the `vibe-coders3` scope),
  `main` auto-deploys, URL **`dental-business-dusky.vercel.app`**. The `catchline.vercel.app` name
  is taken by another project, so the dusky URL stays until the real domain is bought. **Vercel is
  on Pro** (the free tier got paused by an unrelated project, `stockanalyzer`/shorts-analytics,
  which burned the CPU cap; it has been deleted. Consider setting a Spend Management cap).
- **Design system in place** ([`docs/15`](docs/15-design-system.md)): Young Serif display headings
  (Fraunces, then Newsreader, retired as AI-tells; single weight, size-based hierarchy, never
  bold/italic) + Public Sans body + Fragment Mono "switchboard" micro-labels, steel-blue accent,
  semantic tints only (red/emerald/amber), up to two ink bands per page + the ticker strip, scroll
  reveals via `src/components/Reveal.tsx` (16px/550ms, reduced-motion safe, no-JS safe), zero
  emojis in the UI (SVG icons instead).
- **Landing page v3 ("Young Serif" direction, owner-picked):** hero (single CTA) with the animated
  SMS demo (missed call stamp, instant text-back, intake, staff handoff, mono caption), the slogan
  section, a dashboard inbox peek, a **dark $150 pricing band** (what's-included as prose, no card
  grid), a 6-question FAQ (native accordions), and a mono sign-off strip. Owner removed as
  AI-tells: the recovery-ticker strip, the 4-item included grid, the "See it in action" button,
  the captured-lead ledger row on the demo card, the "Where patients go missing" ink band (giant
  numerals + note card), heading trailing periods, and colored accent words in headings (one
  survives: "miss" in the hero). **Demo honesty rule: the AI never offers or books times on the
  page, a named staff member does** (matches the Terms).
- **Brand mark: original logo retained.** The "catch line" Wordmark B (two points + sagging
  stroke) was implemented, then reverted at the owner's request; the original image logo
  (`public/logo.png` / `public/icon.png` / favicon `src/app/icon.png`) is back everywhere.
  Wordmark B stays on file as a candidate for the stylized trademark filing (docs/16). Empty
  states follow one-message-one-next-step (`src/components/ui/EmptyState.tsx`).
- **Auth works:** sign up / sign in (password + magic link) + platform-admin allow-list
  (`andrewbirdie777@gmail.com` → `/admin`). Configured via `src/lib/constants.ts` / `ADMIN_EMAILS`.
- **Hybrid onboarding:** clinics self-sign-up and own their dashboard; the admin can configure any
  clinic at `/admin/clinics/[id]` (the "free setup").
- **Twilio: LIVE (2026-10).** Account upgraded (Individual for now, auto-recharge OFF), MFA on.
  **+1 (437) 476-9802 (Toronto, SMS+MMS+Voice)**: compliance wizards done, both webhooks set, env
  keys in Vercel, live test passed (text → AI intake → lead in dashboard; call → greeting →
  text-back → front-desk page). The number is assigned to the first pilot clinic. Switch the
  account to Business after the entity is registered, then A2P 10DLC only if/when texting US
  patients (Canadian traffic doesn't need it).
- **AI intake: LIVE on OpenAI** (`OPENAI_API_KEY` in Vercel, marked Sensitive; restricted key,
  chat completions only; small prepaid credit, auto-recharge off; default model `gpt-4o-mini`).
  The scripted fallback now extracts names from conversational replies ("thanks, I'm Andrew" →
  "Andrew"; `extractName` in `src/lib/ai/intake.ts`, pinned by tests) instead of storing the
  whole message.
- **First pilot in progress: Emerald Park Dental** (owner's relative, free 14-day pilot). Clinic
  configured, internal tests passed; blocked only on conditional forwarding on their Rogers
  business landline (see "Immediate next steps").
- **Admin clinic management:** each clinic row in `/admin` has a 3-dot menu with a guarded delete
  (`deleteClinicAsAdmin` returns `{ ok, error }` and surfaces failures as an alert instead of
  crashing). Migration **0004 applied in production**, which unblocked clinic deletes and
  `erase_clinic()`.
- **Stripe paywall scaffolded, dormant** until keys are set: `/billing` page + sidebar item,
  `/api/stripe/{checkout,portal,webhook}`, `src/lib/stripe.ts` (no SDK dependency), soft
  payment-needed banner in the dashboard layout (non-blocking by design). ⚠️ Migration
  `supabase/migrations/0003_billing.sql` has **NOT been applied to Supabase yet**, run it before
  turning billing on. Env vars: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`.
- **Trademark:** ™ shown on the wordmark (common-law claim). [`docs/16`](docs/16-trademark-brief.md)
  has the filing brief + a ready-to-file packet (classes 9/42/38 wording). Preliminary clearance is
  a **yellow flag**: "Catchline Communications" and "Catchline Agency" already operate in
  marketing/communications. Get a professional clearance opinion before paying to file; file after
  the entity exists; keep a backup name in mind.
- **Data residency:** Supabase **`ca-central-1` (Montreal)** for Canadian/PHIPA comfort.
- **Hardening done:** input validation, security headers, append-only audit log, abuse/cost cap,
  RLS multi-tenancy, Twilio signature checks, 30 unit tests + CI + Dependabot + secret scanning.
  MFA enabled on Google/Vercel/Supabase/Twilio (owner task, done 2026-07).
- **Review fixes (2026-07):** missed-call notification only claims "Text-back sent" when true;
  Missed-calls "today" counts in the clinic's timezone; OpenGraph metadata with a crash-safe
  `metadataBase` (a malformed `NEXT_PUBLIC_APP_URL` can no longer break deploys).
- **Stack: Next 15.5.22** (React 18), Vitest 4, `npm audit` 0 vulnerabilities (the 2026-10
  advisory wave was patched: Next/eslint-config-next 15.5.19 → 15.5.22, postcss floor 8.5.23,
  `sharp` >=0.35 override, transitive fixes). ⚠️ The `main`
  **branch ruleset is DISABLED** (it blocked deploy automation), re-enable with a bypass once a
  collaborator is added.
- **Legal pages live, lawyer-reviewed (scored 8.5-9/10):** Privacy Policy (`/privacy`), Terms
  (`/terms`), DPA (`/dpa`), linked from footer + sign-up. Lawyer-ready copies in `docs/legal/`.
  Legal entity: **Catchline Services Inc. (not yet registered)**. Support/privacy contact:
  `team.catchlineservices@gmail.com` (`BRAND.supportEmail` in `src/lib/constants.ts` feeds all
  three pages; the `docs/legal/` copies match).
  ⏳ Still to do: fill the **[mailing address]** placeholder in the Privacy Policy + DPA, register
  the entity, final counsel re-review (incl. Ontario PHIPA) before signing a clinic.
- **Pricing:** introductory **$150 CAD/month** per clinic (after a 14-day pilot). Consistent across
  site + Terms; keep the pitch deck/pilot agreement/invoices at the same number.
- **Platform live; first clinic pending** only its carrier forwarding (see "Immediate next
  steps"). No real patient traffic flows until that forwarding is on.

---

## 📌 BEFORE YOUR FIRST PAYING CLINIC, do these
When you land your first client, run this list (open a new chat and say *"I got my first client -
run the launch checklist"*).

1. **Finish Twilio** (see "Immediate next steps" + [`docs/17`](docs/17-twilio-go-live-runbook.md)):
   env keys, webhooks, clinic config, live test, then the clinic's conditional call forwarding.
   For a real clinic: move the Twilio account to **Business** (after incorporation). A2P 10DLC only
   for US-bound texting.
2. **AI key: ✅ DONE** (`OPENAI_API_KEY` live in Vercel; the scripted fallback remains the
   outage safety net).
3. **Buy a domain** (e.g. `trycatchline.com`), point Vercel at it, then update the 3 places that
   reference the URL: `NEXT_PUBLIC_APP_URL` (Vercel) → Supabase Auth URL Configuration → Twilio
   webhooks. (See chat notes / `docs/08`.)
4. **SMTP email:** verify the domain in Resend, set Supabase Custom SMTP to send from
   `noreply@yourdomain`. (Built-in Supabase email works until then.)
5. **Turn on the paywall:** apply `supabase/migrations/0003_billing.sql`, create the $150 CAD/month
   recurring price in Stripe, add `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` + `STRIPE_WEBHOOK_SECRET`
   to Vercel, point a Stripe webhook at `/api/stripe/webhook`, test with the 4242 card.
6. **Supabase Pro:** upgrade for daily backups; add **PITR** once you run 2-3 clinics.
7. **Data residency: ✅ DONE**, on `ca-central-1` (Montreal).
8. **Retention: ✅ DONE**, `pg_cron` job `purge-old-conversations` (monthly
   `select purge_old_conversations(365);`). Verify with `select * from cron.job;`.
9. **Privacy policy + DPA + Terms: ✅ DONE** (published in-app; counsel re-review + mailing address
   still pending, see status).
10. **Entity + insurance:** register Catchline Services Inc., get the final counsel re-review
    (Ontario PHIPA), and buy cyber/professional liability insurance before signing a clinic.

## 🔧 Deferred / optional (not blocking launch)
- MFA + session inactivity timeouts for clinic users (Supabase Auth).
- **Re-enable the `main` branch ruleset** (currently disabled) once you add a collaborator, and
  add the deploy app to its bypass list so automated deploys aren't blocked.
- Hard paywall gating (the billing banner is soft/non-blocking today; flip to blocking later).
- Trademark filing (after entity + clearance opinion, `docs/16`).
- Integration/e2e tests (Playwright), strict Content-Security-Policy, load/chaos testing, rationale
  in `docs/10-production-readiness.md`.

---

## How to resume in a new chat
> "Read `CLAUDE.md`, `README.md`, and `docs/`. We're building Catchline (missed-call recovery for
> dental clinics). Continue from the status in CLAUDE.md."

## Key commands
```bash
npm run dev        # local dev
npm run build      # production build (also runs ESLint; the real pre-push gate)
npm run test       # 30 unit tests (Vitest)
npx vitest run src/lib/__tests__/intake.test.ts   # one test file
npx vitest run -t "captures the name"             # one test by name
npm run typecheck  # tsc --noEmit
```

## Where things live
- Architecture + data model: `docs/02`, `docs/04`. Twilio setup: `docs/08` + runbook `docs/17`.
- **Landing a client: follow [`docs/18-clinic-onboarding.md`](docs/18-clinic-onboarding.md)**
  (per-clinic playbook: buy their number, webhooks, configure, test, carrier forwarding, pilot).
- Design system: `docs/15`. Trademark: `docs/16`.
- Webhooks: `src/app/api/twilio/{voice,sms}`. AI intake: `src/lib/ai/intake.ts`.
- Billing: `src/app/api/stripe/*`, `src/lib/stripe.ts`, `/billing` page, migration `0003`.
- Landing: `src/app/page.tsx` (+ `src/components/Reveal.tsx` for scroll motion).
- Admin: `src/app/admin/`. Brand name: `src/lib/constants.ts`.
