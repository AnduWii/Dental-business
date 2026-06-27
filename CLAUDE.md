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
> Steel-blue accent on a near-monochrome base, Fraunces headings + Public Sans body, `rounded-md`
> for primary buttons, `shadow-sm` max (no blur or glow), zero emojis, 150ms hover fades, and no
> generic AI-slop phrasing.

---

## ✅ Current status (updated 2026-06-21)
- **V1 built and deployed** on Vercel (`main` auto-deploys; project "dental-business",
  URL `dental-business-dusky.vercel.app`).
- **Design:** Public Sans typeface; landing has a two-column hero with a live "phone" SMS recovery
  card (cracked-molar emergency → booked → lead captured). Muted steel-blue brand palette.
- **Auth works:** sign up / sign in (password + magic link) + platform-admin allow-list
  (`andrewbirdie777@gmail.com` → `/admin`). Configured via `src/lib/constants.ts` / `ADMIN_EMAILS`.
- **Hybrid onboarding:** clinics self-sign-up and own their dashboard; the admin can configure any
  clinic at `/admin/clinics/[id]` (the "free setup").
- **Data residency:** on Supabase **`ca-central-1` (Montreal)** for Canadian/PHIPA comfort. Old
  `us-east-1` project has been deleted.
- **Hardening done (Steps 3 & 4):** input validation, security headers, append-only audit log,
  abuse/cost cap, RLS multi-tenancy, 27 unit tests + GitHub CI + Dependabot + secret scanning.
- **Stack on Next 15.5.19** (upgraded from 14.2.35, still React 18). Dependency backlog triaged:
  `npm audit` is **0 vulnerabilities** (was 21). Vitest is now v4; postcss pinned via `overrides`.
  ⚠️ The `main` **branch ruleset is currently DISABLED** (it blocked the deploy automation) -
  re-enable it with the deploy app on the bypass list once you add a collaborator.
- **Legal pages live, lawyer-reviewed (v1):** public **Privacy Policy** (`/privacy`),
  **Terms of Service** (`/terms`), and clinic **DPA** (`/dpa`), linked from the footer + sign-up
  form. Lawyer-ready copies in `docs/legal/`. Acted on the lawyer's first review: added an IP
  section, an AI-clinical disclaimer (no diagnosis/treatment/clinical urgency), a CASL clinic
  warranty, a 72-hour breach-notice timing, arbitration + class-action waiver, stronger liability
  language, and an internal security policy (`docs/14-information-security.md`). Legal entity:
  **Catchline Services Inc.** (not yet registered).
  ⏳ Still to do: fill the **[mailing address]** placeholder in the Privacy Policy + DPA, register
  the entity, and get a final counsel re-review (including an Ontario PHIPA review) before signing.
- **Pricing:** introductory **$150 CAD/month** per clinic (after a 14-day pilot); revisit later.
- **NOT yet live for real calls**, Twilio isn't connected (see below).

---

## 📌 BEFORE YOUR FIRST PAYING CLINIC, do these
When you land your first client, run this list (open a new chat and say *"I got my first client -
run the launch checklist"*).

1. **Connect Twilio (required to send/receive anything).** Buy a local number; add
   `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` (+ optional `TWILIO_MESSAGING_SERVICE_SID`) to Vercel;
   set the number's Voice + Messaging webhooks; set up conditional call forwarding on the clinic's
   line. **Submit A2P 10DLC registration early, it has multi-day lead time.** See `docs/08`.
   (You can connect a Twilio number *now* to test the full call→text→intake flow on your own phone;
   it is only *required* by your first clinic, not gated to it.)
2. **(Optional) AI key:** add `OPENAI_API_KEY` to Vercel for smarter intake (scripted fallback
   works without it).
3. **Buy a domain** (e.g. `trycatchline.com`), point Vercel at it, then update the 3 places that
   reference the URL: `NEXT_PUBLIC_APP_URL` (Vercel) → Supabase Auth URL Configuration → Twilio
   webhooks. (See chat notes / `docs/08`.)
4. **SMTP email (hardening 3c):** verify the domain in Resend, set Supabase Custom SMTP to send from
   `noreply@yourdomain`. (Built-in Supabase email works until then.)
5. **Supabase Pro (hardening Step 5):** upgrade for daily backups; add **PITR** once you run 2–3
   clinics.
6. **Data residency (Step 6): ✅ DONE**, on `ca-central-1` (Montreal). Old `us-east-1` project
   deleted.
7. **Retention (Step 7): ✅ DONE**, `pg_cron` job `purge-old-conversations` scheduled (monthly
   `select purge_old_conversations(365);`). Verify any time with `select * from cron.job;`.
8. **Privacy policy + clinic DPA (Step 8): ✅ DONE**, published in-app at `/privacy` and `/dpa`
   (linked from the site footer + sign-up form). Source: `src/app/{privacy,dpa}/page.tsx`. ⚠️ Before
   signing a clinic, have counsel review the wording and fill the DPA's bracketed fields (legal
   entity name, signatures).
9. **Terms of Service: ✅ DONE**, published at `/terms`. Lawyer-ready copies of the Privacy
   Policy, DPA, and Terms are in `docs/legal/` (counsel review still pending).

## 🔧 Deferred / optional (not blocking launch)
- MFA + session inactivity timeouts (Supabase Auth).
- **Re-enable the `main` branch ruleset** (currently disabled) once you add a collaborator, and
  add the deploy app to its bypass list so automated deploys aren't blocked.
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
- Architecture + data model: `docs/02`, `docs/04`.
- Webhooks: `src/app/api/twilio/{voice,sms}`. AI intake: `src/lib/ai/intake.ts`.
- Admin: `src/app/admin/`. Brand name: `src/lib/constants.ts`.
