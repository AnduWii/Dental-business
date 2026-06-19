# Recall — project guide & status

> Missed-call recovery for dental clinics. When a clinic misses a call, Recall texts the caller
> back, runs a short AI intake (name, reason, urgency, booking intent), logs it, and pages the
> front desk. Full docs in [`README.md`](README.md) and [`docs/`](docs/).

This file is the at-a-glance status + the **"before first paying clinic"** checklist. If you're a
new session: read this, then `README.md` and `docs/`.

---

## ✅ Current status (updated 2026-06-19)
- **V1 built and deployed** on Vercel (`main` auto-deploys; project "dental-business",
  URL `dental-business-dusky.vercel.app`).
- **Auth works:** sign up / sign in (password + magic link) + platform-admin allow-list
  (`andrewbirdie777@gmail.com` → `/admin`). Configured via `src/lib/constants.ts` / `ADMIN_EMAILS`.
- **Hybrid onboarding:** clinics self-sign-up and own their dashboard; the admin can configure any
  clinic at `/admin/clinics/[id]` (the "free setup").
- **Hardening done (Steps 3 & 4):** input validation, security headers, append-only audit log,
  abuse/cost cap, RLS multi-tenancy, 27 unit tests + GitHub CI + Dependabot + secret scanning,
  branch ruleset on `main` (admin bypass).
- **NOT yet live for real calls** — Twilio isn't connected (see below).

---

## 📌 BEFORE YOUR FIRST PAYING CLINIC — do these
When you land your first client, run this list (open a new chat and say *"I got my first client —
run the launch checklist"*).

1. **Connect Twilio (required to send/receive anything).** Buy a local number; add
   `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` (+ optional `TWILIO_MESSAGING_SERVICE_SID`) to Vercel;
   set the number's Voice + Messaging webhooks; set up conditional call forwarding on the clinic's
   line. **Submit A2P 10DLC registration early — it has multi-day lead time.** See `docs/08`.
2. **(Optional) AI key:** add `OPENAI_API_KEY` to Vercel for smarter intake (scripted fallback
   works without it).
3. **Buy a domain** (e.g. `tryrecall.com`), point Vercel at it, then update the 3 places that
   reference the URL: `NEXT_PUBLIC_APP_URL` (Vercel) → Supabase Auth URL Configuration → Twilio
   webhooks. (See chat notes / `docs/08`.)
4. **SMTP email (hardening 3c):** verify the domain in Resend, set Supabase Custom SMTP to send from
   `noreply@yourdomain`. (Built-in Supabase email works until then.)
5. **Supabase Pro (hardening Step 5):** upgrade for daily backups; add **PITR** once you run 2–3
   clinics.
6. **Data residency (Step 6):** project is in `us-east-1`. If a clinic requires Canadian residency
   (PHIPA comfort), recreate the project in `ca-central-1` and migrate. Decide before onboarding.
7. **Retention (Step 7):** enable `pg_cron` and schedule `select purge_old_conversations(365);`
   monthly.
8. **Privacy policy + clinic DPA (Step 8):** one-pager basis in `docs/12-compliance-privacy.md`.

## 🔧 Deferred / optional (not blocking launch)
- MFA + session inactivity timeouts (Supabase Auth).
- Full branch protection: drop the admin bypass once you add a collaborator.
- Integration/e2e tests (Playwright), strict Content-Security-Policy, load/chaos testing — rationale
  in `docs/10-production-readiness.md`.

---

## How to resume in a new chat
> "Read `CLAUDE.md`, `README.md`, and `docs/`. We're building Recall (missed-call recovery for
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
