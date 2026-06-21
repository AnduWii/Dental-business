# 07 · 30-Day Development Roadmap

Goal: a paying clinic by day 30. One student builder. Revenue and proof beat polish.

Sequencing principle: **get a real text-back working end-to-end on a real phone by end of Week 1**,
then layer intake, dashboard, and hardening. You should be able to demo "call → text" within days,
because the business doc says the demo closes in under 60 seconds.

This repository already contains everything below — the roadmap is how to build it from scratch (or
how to verify/extend it) in four weeks.

---

## Week 1 — Telephony spine (the demo)
**Outcome:** call a number, don't answer, get a text back, and reply over SMS. Live.

- [x] Next.js + Tailwind + TypeScript skeleton on Vercel; `git push` deploys.
- [x] Supabase project; run `0001_init.sql` (schema + RLS + realtime).
- [x] Twilio account + 1 number. Provision, note the SID/token.
- [x] `lib/env`, `lib/supabase/*`, `lib/twilio` plumbing.
- [x] **`/api/twilio/voice`** — log missed call, open conversation, send the text-back, return
      TwiML. Signature-validated, idempotent on `CallSid`.
- [x] **`/api/twilio/sms`** — store inbound, echo a simple reply (AI comes Week 2).
- [x] Set up conditional call forwarding on a test line; verify the loop end-to-end.

> Milestone: you can do the 60-second demo on your own phone.

## Week 2 — Intake + capture (the value)
**Outcome:** the conversation captures name, reason, urgency, booking intent — and pages the clinic.

- [x] **`lib/ai/intake`** — provider-agnostic engine, OpenAI structured output, emergency
      detection, and the deterministic fallback.
- [x] Wire intake into the SMS webhook: build thread → reply → persist captured fields.
- [x] **`lib/notify`** — page the front desk by SMS (+ optional email) + dashboard feed.
- [x] Page on emergency and on first `intake_complete` (new lead).
- [x] STOP/START opt-out handling; never text opted-out patients.

> Milestone: a stranger texting the number gets sensibly interviewed, and your phone buzzes with a
> lead.

## Week 3 — Clinic dashboard (the product they log into)
**Outcome:** a clinic can sign in and work their leads.

- [x] Magic-link auth + middleware route guard + onboarding (create clinic/profile).
- [x] **Inbox** with live updates (realtime refresh), status/urgency/intent badges.
- [x] **Conversation view**: full thread, captured-lead panel, **manual reply**, **AI/human
      takeover**.
- [x] **Missed-calls** log (the sales proof) and **Notifications** feed.
- [x] **Settings**: number, text-back copy, AI toggle, paging targets, webhook URLs.

> Milestone: hand a founding clinic a login and they understand it without training.

## Week 4 — Harden, pilot, sell
**Outcome:** running on a real clinic's number; first pilot agreement signed.

- [ ] A2P 10DLC / number registration submitted early in the week (it has lead time).
- [ ] End-to-end test matrix: missed call, reply, emergency, STOP, takeover, duplicate webhooks.
- [ ] Production env on Vercel; custom domain; Twilio webhooks pointed at prod.
- [ ] Error logging (Vercel logs + Sentry free tier optional); basic uptime check.
- [ ] Onboard founding clinic #1: forwarding configured, text-back copy set, front-desk number set.
- [ ] Run the **lunch-hour call test** on prospects to generate proof; book pilot meetings.
- [ ] Pilot terms: 14 days, free setup, no contract → continue at **$150/mo** if it recovers
      patients.

> Milestone: a clinic's real missed calls are being recovered, and you've got the pilot→paid
> trigger agreed.

---

## Explicitly NOT in the 30 days
Calendar/PMS integration, Stripe self-serve billing, analytics, team seats, voicemail
transcription, mobile app. All deferred to V2 (see `docs/01-product-scope.md`). The first three
clinics are hand-onboarded and invoiced manually — their **case studies are worth more than the
revenue.**
