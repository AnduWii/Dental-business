# Catchline, project guide & status

> Missed-call recovery for dental clinics. When a clinic misses a call, Catchline texts the caller
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
> scroll reveals only per the rules in docs/15, no AI-slop phrasing, and **never sets of three**
> (no card trios, numbered steps, or icon grids; the owner rejects these on sight).

---

## ▶ Immediate next steps (where we left off, 2026-07-05)
Mid-way through connecting Twilio (full runbook: [`docs/17`](docs/17-twilio-go-live-runbook.md)):
1. In Vercel (project **catchline**, the one connected to `AnduWii/Dental-business`), add env vars
   `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN`, and verify `NEXT_PUBLIC_APP_URL` is exactly
   `https://dental-business-dusky.vercel.app`. Redeploy.
2. In Twilio, on **+1 (437) 476-9802**: set Voice "A call comes in" (Webhook, POST) to
   `<app-url>/api/twilio/voice` and Messaging "A message comes in" to `<app-url>/api/twilio/sms`.
   Also finish adding the **Voice channel** in the number's compliance wizard (Messaging was done).
3. In the app: `/admin`, open the clinic, set Catchline number `+14374769802`, front-desk mobile =
   owner's cell, AI on, save.
4. Live test: text the number, then call it; verify the AI replies, the front-desk page lands, and
   the lead shows in `/dashboard`.

## ✅ Current status (updated 2026-07-05)
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
  SMS demo (missed call stamp, instant text-back, intake, staff handoff, captured-lead ledger,
  mono caption), the dark "Where patients go missing" band with giant serif numerals and an
  offset-outline note card, the slogan section (accented "the cracks."), a dashboard inbox peek,
  a **dark $150 pricing band** (what's-included as prose, no card grid), a 6-question FAQ (native
  accordions), and a mono sign-off strip. Owner removed as AI-tells: the recovery-ticker strip,
  the 4-item included grid, and the "See it in action" button. **Demo honesty rule: the AI never
  offers or books times on the page, a named staff member does** (matches the Terms).
- **Auth works:** sign up / sign in (password + magic link) + platform-admin allow-list
  (`andrewbirdie777@gmail.com` → `/admin`). Configured via `src/lib/constants.ts` / `ADMIN_EMAILS`.
- **Hybrid onboarding:** clinics self-sign-up and own their dashboard; the admin can configure any
  clinic at `/admin/clinics/[id]` (the "free setup").
- **Twilio: in progress.** Account upgraded (Individual for now, ~$20 balance, auto-recharge OFF),
  MFA on. **Canadian number purchased: +1 (437) 476-9802 (Toronto), SMS+MMS+Voice.** Messaging
  compliance wizard completed; Voice channel add + webhooks + env keys + live test remain (see
  "Immediate next steps"). Switch the account to Business after the entity is registered, then do
  A2P 10DLC only if/when texting US patients (Canadian traffic doesn't need it).
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
  RLS multi-tenancy, Twilio signature checks, 27 unit tests + CI + Dependabot + secret scanning.
  MFA enabled on Google/Vercel/Supabase/Twilio (owner task, done 2026-07).
- **Review fixes (2026-07):** missed-call notification only claims "Text-back sent" when true;
  Missed-calls "today" counts in the clinic's timezone; OpenGraph metadata with a crash-safe
  `metadataBase` (a malformed `NEXT_PUBLIC_APP_URL` can no longer break deploys).
- **Stack: Next 15.5.19** (React 18), Vitest 4, `npm audit` 0 vulnerabilities. ⚠️ The `main`
  **branch ruleset is DISABLED** (it blocked deploy automation), re-enable with a bypass once a
  collaborator is added.
- **Legal pages live, lawyer-reviewed (scored 8.5-9/10):** Privacy Policy (`/privacy`), Terms
  (`/terms`), DPA (`/dpa`), linked from footer + sign-up. Lawyer-ready copies in `docs/legal/`.
  Legal entity: **Catchline Services Inc. (not yet registered)**.
  ⏳ Still to do: fill the **[mailing address]** placeholder in the Privacy Policy + DPA, register
  the entity, final counsel re-review (incl. Ontario PHIPA) before signing a clinic.
- **Pricing:** introductory **$150 CAD/month** per clinic (after a 14-day pilot). Consistent across
  site + Terms; keep the pitch deck/pilot agreement/invoices at the same number.
- **NOT yet live for real calls** until the "Immediate next steps" above are finished.

---

## 📌 BEFORE YOUR FIRST PAYING CLINIC, do these
When you land your first client, run this list (open a new chat and say *"I got my first client -
run the launch checklist"*).

1. **Finish Twilio** (see "Immediate next steps" + [`docs/17`](docs/17-twilio-go-live-runbook.md)):
   env keys, webhooks, clinic config, live test, then the clinic's conditional call forwarding.
   For a real clinic: move the Twilio account to **Business** (after incorporation). A2P 10DLC only
   for US-bound texting.
2. **(Optional) AI key:** add `OPENAI_API_KEY` to Vercel for smarter intake (scripted fallback
   works without it).
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
npm run build      # production build
npm run test       # 27 unit tests
npm run typecheck  # tsc --noEmit
```

## Where things live
- Architecture + data model: `docs/02`, `docs/04`. Twilio setup: `docs/08` + runbook `docs/17`.
- Design system: `docs/15`. Trademark: `docs/16`.
- Webhooks: `src/app/api/twilio/{voice,sms}`. AI intake: `src/lib/ai/intake.ts`.
- Billing: `src/app/api/stripe/*`, `src/lib/stripe.ts`, `/billing` page, migration `0003`.
- Landing: `src/app/page.tsx` (+ `src/components/Reveal.tsx` for scroll motion).
- Admin: `src/app/admin/`. Brand name: `src/lib/constants.ts`.
