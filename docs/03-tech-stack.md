# 03 · Technology Stack

Every choice judged on the four things that matter for a 30-day, student-built, revenue-first
product: **why**, **monthly cost**, **scalability**, **implementation difficulty**.

> Costs assume the pilot stage (1–10 clinics). Currency mixed USD; treat as approximate.

## Summary

| Layer | Choice | Monthly cost (pilot) | Scales to | Difficulty |
|---|---|---|---|---|
| Frontend + Backend | Next.js on Vercel | $0 (Hobby) → $20 (Pro) | Thousands of clinics | Low |
| Database / Auth / Realtime | Supabase | $0 → $25 (Pro) | Millions of rows | Low–Med |
| SMS + Voice | Twilio | ~$1.15/number + usage | Unlimited | Medium |
| AI intake | OpenAI `gpt-4o-mini` (or Claude Haiku) | a few $ | Unlimited | Low |
| Email alerts (optional) | Resend | $0 (3k/mo) | Plenty | Low |
| **Total to run a pilot** | | **≈ $5–25 / clinic / month** | | |

At $299/clinic/month, gross margin is ~90%+. The economics work from clinic #1.

---

## Next.js (App Router) + Vercel — frontend **and** backend

- **Why:** One framework gives you the marketing site, the dashboard (React Server Components), and
  the backend (API route handlers) in a single repo and a single deploy. There is no second service
  to run — `/api/twilio/sms` *is* your Node backend. Vercel deploys on `git push` with HTTPS, env
  vars, and logs out of the box, which is exactly what Twilio webhooks need.
- **Monthly cost:** Hobby $0 covers a pilot; Pro $20 when you want custom domains/teams/more
  function time.
- **Scalability:** Serverless functions scale horizontally with no work. Stateless by design.
- **Difficulty:** **Low.** The most documented stack in the world; a student can be productive day
  one.

## Supabase — Postgres + Auth + Realtime + RLS

- **Why:** It collapses four services into one. Real Postgres (not a toy), **passwordless auth**
  for clinic staff, **Row Level Security** for hard multi-tenant isolation, and **realtime**
  subscriptions so the dashboard lights up the instant a lead arrives. The free tier is generous.
- **Monthly cost:** Free tier (500MB DB, 50k MAU) covers a pilot easily; Pro $25 adds backups and
  removes pausing. Our data is tiny (text rows), so you stay free for a long time.
- **Scalability:** Postgres handles millions of conversations/messages; add indexes (already in the
  migration) and you're fine well past product-market fit.
- **Difficulty:** **Low–Medium.** Client libraries are simple; the one concept to learn is RLS,
  which this codebase already sets up.

## Twilio — SMS + Voice

- **Why:** The standard for programmable messaging and the canonical "missed-call text-back"
  pattern. Critically, it also solves **detection**: the clinic forwards unanswered calls to a
  Twilio number, the voice webhook fires, and we text back. Twilio also auto-handles STOP/HELP
  compliance keywords. Deliverability and support are best-in-class.
- **Monthly cost:** ~$1.15/number/month + ~$0.0079 per SMS segment + ~$0.0085/min for the short
  forwarded voice leg. A pilot clinic costs a few dollars/month in usage.
- **Scalability:** Effectively unlimited; one number per clinic.
- **Difficulty:** **Medium.** The code is easy; the real-world friction is **A2P 10DLC
  registration** (US) / number provisioning (Canada) and getting the clinic to set up call
  forwarding. Budget a few days of lead time. See `docs/08-twilio-setup.md`.

## AI intake — OpenAI `gpt-4o-mini` (Anthropic Claude Haiku as a drop-in)

- **Why:** Intake is a small, well-bounded task — hold a short chat, extract four fields. A small,
  cheap model nails it with **structured outputs** (we force a JSON schema), so parsing is reliable.
  The provider is behind an env var (`AI_PROVIDER`), and if no key is set the system uses a
  **deterministic scripted flow** — so the product is never hostage to an API.
- **Monthly cost:** Pennies. A full intake is a handful of short turns ≈ a few thousand tokens;
  realistically **a few cents per recovered caller**, single-digit dollars/clinic/month.
- **Scalability:** Stateless API calls; scales with spend.
- **Difficulty:** **Low.** One `fetch`. The fallback means you can even launch a pilot before wiring
  the model.

## Resend — email alerts (optional)

- **Why:** A second paging channel for the front desk. Optional: SMS paging works without it.
- **Cost:** Free up to 3,000 emails/month.
- **Difficulty:** **Low** — one `fetch`, only used if `RESEND_API_KEY` is set.

---

## What we deliberately did **not** choose
- **A separate Express/Nest backend** — redundant; Next.js API routes cover it. Fewer moving parts.
- **A managed queue (SQS/Inngest)** — webhook volume is low; synchronous handlers + idempotency are
  enough for V1. Add a queue in V2 if AI latency becomes an issue.
- **Prisma/Drizzle ORM** — the Supabase client is enough and keeps the dependency surface (and the
  learning curve) small. Raw SQL migration is checked in and readable.
- **A component library (MUI/Chakra)** — Tailwind keeps the bundle tiny and the UI consistent
  without fighting a framework.
