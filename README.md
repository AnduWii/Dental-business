# Catchline — missed-call recovery for dental clinics

> Every missed call, recovered.

When a dental clinic misses a call, **Catchline** instantly texts the caller back, holds a short SMS
conversation to capture their **name, reason, urgency, and booking intent**, logs everything, and
**pages the front desk** so a human can take over and book the patient.

It works **before any calendar integration exists** — the whole job of V1 is to recover the caller
and create a booking conversation. That's enough to sell.

---

## Why this stack

The fastest route from *idea → working product → paying clinic*, buildable by one student and
deployable in under 30 days:

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend | **Next.js (App Router)** on **Vercel** | One codebase, one deploy. API routes *are* the Node backend. |
| Database + Auth + Realtime | **Supabase** (Postgres) | DB, passwordless auth, Row Level Security and live updates in one free tier. |
| SMS + Voice | **Twilio** | Industry-standard missed-call→text-back. Handles compliance (STOP/HELP). |
| AI intake | **OpenAI** (or Anthropic) | Cheap, structured extraction. Optional — falls back to a scripted flow. |

Full reasoning, costs and trade-offs: [`docs/03-tech-stack.md`](docs/03-tech-stack.md).

## Documentation

| Doc | Contents |
|---|---|
| [`docs/01-product-scope.md`](docs/01-product-scope.md) | What's in V1, what's deferred to V2, what we never build |
| [`docs/02-architecture.md`](docs/02-architecture.md) | System diagram + request flows |
| [`docs/03-tech-stack.md`](docs/03-tech-stack.md) | Every choice: why, cost, scalability, difficulty |
| [`docs/04-database-schema.md`](docs/04-database-schema.md) | Every table, every column |
| [`docs/05-user-flow.md`](docs/05-user-flow.md) | Patient + clinic journeys, every screen |
| [`docs/06-wireframes.md`](docs/06-wireframes.md) | Wireframes for every page |
| [`docs/07-roadmap.md`](docs/07-roadmap.md) | Week-by-week build plan |
| [`docs/08-twilio-setup.md`](docs/08-twilio-setup.md) | Call forwarding, 10DLC & CASL compliance |
| [`docs/10-production-readiness.md`](docs/10-production-readiness.md) | Hardening checklist: security, tests, compliance, DR — done / partial / deferred |
| [`docs/11-security.md`](docs/11-security.md) | Threat model + controls |
| [`docs/12-compliance-privacy.md`](docs/12-compliance-privacy.md) | PIPEDA/PHIPA/CASL, PII inventory, retention & erasure |
| [`docs/13-disaster-recovery.md`](docs/13-disaster-recovery.md) | RTO/RPO + restore runbook |
| [`docs/adr/`](docs/adr/README.md) | Architecture Decision Records |

---

## Project structure

```
.
├── supabase/migrations/0001_init.sql   # Complete schema + RLS + realtime
├── src/
│   ├── middleware.ts                    # Auth session refresh + route guard
│   ├── lib/
│   │   ├── env.ts                        # Lazy, validated env access
│   │   ├── types.ts                      # DB row types (mirrors the schema)
│   │   ├── constants.ts                  # Brand name in one place
│   │   ├── format.ts                     # phone / time helpers
│   │   ├── auth.ts                        # session + tenancy guards
│   │   ├── twilio.ts                      # SMS send, signature check, TwiML
│   │   ├── notify.ts                      # pages the clinic (SMS/email/feed)
│   │   ├── ai/intake.ts                   # the conversational capture engine
│   │   └── supabase/{client,server,admin}.ts
│   ├── components/
│   │   ├── Sidebar.tsx · RealtimeRefresher.tsx
│   │   ├── ConversationView.tsx           # live thread + reply + takeover
│   │   └── ui/badges.tsx
│   └── app/
│       ├── page.tsx                       # Landing
│       ├── login/ · auth/                 # Magic-link auth
│       ├── onboarding/                    # Create clinic
│       ├── (dashboard)/                   # Inbox, conversation, missed-calls,
│       │                                  #   notifications, settings
│       └── api/
│           ├── twilio/voice/              # Missed-call webhook  → text-back
│           ├── twilio/sms/                # Inbound SMS webhook  → AI → page
│           └── conversations/[id]/        # staff reply + AI/human takeover
```

---

## Quickstart

### 1. Prerequisites
- Node 18.18+ (Node 22 recommended)
- A free [Supabase](https://supabase.com) project
- A [Twilio](https://twilio.com) account + one phone number
- (Optional) an OpenAI API key — without it, intake runs in scripted fallback mode

### 2. Install
```bash
npm install
cp .env.example .env.local   # then fill in the values
```

### 3. Database
In the Supabase SQL editor, paste and run `supabase/migrations/0001_init.sql`.
(Or with the Supabase CLI: `supabase db push`.)

### 4. Run
```bash
npm run dev          # http://localhost:3000
```
To receive real Twilio webhooks locally, expose your port with a tunnel and set
`NEXT_PUBLIC_APP_URL` to the tunnel URL:
```bash
npx ngrok http 3000
```

### 5. Connect a clinic
1. Sign in (magic link) and complete onboarding.
2. In **Settings**, paste your Twilio number and copy the two webhook URLs shown there into the
   Twilio number's *Voice* and *Messaging* configuration.
3. Enable conditional call forwarding on the clinic's real line — see
   [`docs/08-twilio-setup.md`](docs/08-twilio-setup.md).

### 6. Deploy
Push to GitHub, import the repo in Vercel, add the same env vars, deploy. Set
`NEXT_PUBLIC_APP_URL` to your Vercel URL and update the Twilio webhooks to match.

---

## Scripts
```bash
npm run dev         # local dev server
npm run build       # production build
npm run start       # run the production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

## Safety & compliance notes
- The AI is an **intake assistant, not a receptionist** — it never books, prices, or gives
  clinical advice. Suspected emergencies are escalated (call 911 / go to ER) and page the clinic.
- STOP/START/HELP opt-out is honoured (CASL/TCPA). Opted-out patients are never texted.
- Twilio webhook signatures are validated in production.
- All tenant data is isolated with Postgres Row Level Security.
