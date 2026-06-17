# 02 · Software Architecture

The simplest thing that works: **one Next.js app on Vercel**, **one Supabase Postgres**, **Twilio**
for telephony, an **LLM** for intake. No separate backend service, no queue, no containers.

## System diagram

```
                          ┌──────────────────────────────────────────────┐
   Patient's phone        │                  VERCEL                       │
        │                 │            Next.js (App Router)               │
        │ 1. calls clinic │                                               │
        ▼                 │   ┌───────────────┐     ┌──────────────────┐  │
  Clinic phone line       │   │  Dashboard    │     │  API routes      │  │
  (no answer / busy)      │   │ (React, RSC)  │     │ (Node runtime)   │  │
        │                 │   │  Inbox        │     │ /api/twilio/voice│  │
        │ 2. conditional  │   │  Conversation │     │ /api/twilio/sms  │  │
        │    forwarding   │   │  Missed calls │     │ /api/convo/...   │  │
        ▼                 │   │  Settings     │     └─────┬─────▲──────┘  │
   ┌─────────┐  3. voice  │   └──────┬────────┘           │     │         │
   │ Twilio  │───webhook──┼──────────┼────────────────────┘     │         │
   │ number  │            │          │ realtime + RLS reads      │         │
   │         │◀──6. send  │          ▼                           │         │
   │         │   text-back│   ┌──────────────┐                   │         │
   └────┬────┘   via REST │   │   SUPABASE   │◀──writes (service ─┘        │
        │                 │   │   Postgres   │   role, server-side)        │
        │ 4. text-back    │   │  + Auth      │                             │
        ▼                 │   │  + Realtime  │     5. AI intake            │
   Patient's phone        │   └──────────────┘   ┌──────────────┐          │
        │                 │                      │ OpenAI /     │          │
        │ 5. patient replies ──webhook──────────▶│ Anthropic    │          │
        └─────────────────┼──────────────────────└──────────────┘          │
                          └──────────────────────────────────────────────┘
                                          │ 7. page the clinic (SMS + email + feed)
                                          ▼
                                   Front-desk mobile / dashboard
```

## Components

| Component | Responsibility |
|---|---|
| **Next.js dashboard** (React Server Components) | Clinic-facing UI. Reads data **as the logged-in user** through Supabase RLS; live-updates via realtime. |
| **Next.js API routes** (Node runtime) | The backend. Twilio webhooks, AI orchestration, staff actions. Write with the **service-role** key after a membership check. |
| **Supabase Postgres** | Single source of truth. All tables carry `clinic_id`; RLS isolates tenants. |
| **Supabase Auth** | Passwordless magic-link login for clinic staff. |
| **Supabase Realtime** | Pushes new messages/leads to open dashboards instantly. |
| **Twilio** | Receives forwarded (missed) calls, sends/receives SMS, handles STOP/HELP. |
| **LLM** | Stateless intake: given the thread, return the next reply + extracted fields. |

## Two critical request flows

### A. Missed call → text-back  (`POST /api/twilio/voice`)
1. Carrier forwards the unanswered call to the clinic's Twilio number.
2. Twilio POSTs the voice webhook. We **validate the signature**.
3. Look up the clinic by the `To` number. Idempotency-check the `CallSid`.
4. Upsert the patient, reuse/open a conversation, insert a `call_events` row.
5. Send the text-back SMS; store it as an outbound message.
6. Return TwiML that politely greets and hangs up the voice leg.

### B. Patient reply → capture → page  (`POST /api/twilio/sms`)
1. Twilio POSTs the inbound SMS. Validate signature; **dedupe** on `MessageSid`.
2. Handle STOP/START (opt-out) first.
3. Store the inbound message.
4. If a human has **taken over** → just page the clinic, never auto-reply.
5. Otherwise run **AI intake** over the thread → reply + `{name, reason, urgency, booking_intent,
   intake_complete}`.
6. Send the reply, persist the captured fields.
7. **Page the clinic** on emergency, or when intake first completes (a fresh lead).

## Design decisions (and why)

- **No separate backend.** Next.js API routes are the Node backend. One repo, one deploy, one
  mental model — ideal for a solo student builder.
- **Writes go through the server, reads go through RLS.** Clients never hold the service key;
  webhooks and server actions do, and always check clinic membership. This keeps client RLS to
  simple SELECT policies and removes a whole class of bugs.
- **AI is stateless and replaceable.** `runIntake()` takes the thread, returns a result. Swap
  providers with an env var; if the key is missing or the call fails, a deterministic scripted flow
  takes over so the product never goes dark.
- **Realtime-by-refresh.** New rows trigger `router.refresh()` rather than hand-managed client
  state — fewer sync bugs, which matters more than elegance here.
- **Idempotency everywhere telephony touches us.** Twilio retries webhooks; unique constraints on
  `CallSid` and `MessageSid` make retries harmless.
