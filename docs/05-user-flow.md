# 05 · User Flow

Two actors: the **patient** (over SMS) and the **clinic** (in the dashboard).

## The headline flow

```
Patient ──calls──▶ Clinic line ──no answer──▶ forwards to Twilio
   ▲                                               │
   │                                               ▼
   │                                     [voice webhook fires]
   │                                     • log missed call
   │                                     • open conversation
   │◀──────── instant text-back ─────────• send first SMS
   │
   │  "Hi, this is Bright Smile Dental. Sorry we missed your call…"
   │
   ├──reply──▶ [sms webhook] ──▶ AI intake ──▶ reply ──▶ Patient
   │              (captures name → reason → urgency → booking intent)
   │
   │  …once intake_complete OR emergency:
   │                         │
   │                         ▼
   │                  PAGE THE CLINIC ──▶ front-desk SMS + dashboard alert
   │                                               │
   │                                               ▼
   └◀──── staff takes over, books the patient ◀──  Clinic dashboard
```

## Patient journey (every step they experience)

| # | Step | What the patient sees |
|---|---|---|
| 1 | Calls the clinic, no answer | Normal ringing, then the call ends with a brief "we'll text you" greeting |
| 2 | Receives text-back (seconds later) | *"Hi, this is {Clinic}. Sorry we missed your call — reply here and we'll get you sorted. How can we help?"* |
| 3 | Replies | Their message |
| 4 | AI asks for name | *"Happy to help! Who do we have the pleasure of texting with?"* |
| 5 | AI asks the reason | *"Thanks Sarah! What can we help you with today?"* |
| 6 | AI gauges urgency / books intent | *"Got it — is this causing you pain right now? And would you like us to book you in?"* |
| 7 | Closing | *"Perfect, thanks Sarah. Someone from our team will text or call you back shortly to get you booked in."* |
| 7b | If emergency | *"This sounds urgent — if it's an emergency please call 911 or go to the nearest ER now. I'm alerting our team right away."* |
| 8 | Staff takes over | Replies now come from a human, seamlessly on the same thread |

## Clinic journey + every screen

| Screen | Route | Purpose |
|---|---|---|
| **Landing** | `/` | Positioning + "Start a pilot" CTA |
| **Login** | `/login` | Passwordless magic-link sign-in |
| **Onboarding** | `/onboarding` | Create clinic, set notify phone/email (first login only) |
| **Inbox** | `/dashboard` | All conversations, newest first; "needs attention" surfaced; live-updating |
| **Conversation** | `/conversations/:id` | Full thread + captured-lead panel + manual reply + AI/human takeover |
| **Missed calls** | `/missed-calls` | Audit log — the proof artifact ("X calls today, all texted back") |
| **Notifications** | `/notifications` | Alert feed: new leads, emergencies, new messages, missed calls |
| **Settings** | `/settings` | Number, text-back copy, AI toggle, paging targets, Twilio webhook URLs |

## State machine — a conversation

```
            missed call / first inbound
                      │
                      ▼
   ┌──────────┐  patient keeps replying   ┌──────────────────┐
   │  active  │ ────────────────────────▶ │  (AI capturing)  │
   └────┬─────┘                            └─────────┬────────┘
        │ intake_complete OR emergency               │ staff sends a reply
        ▼                                             ▼
   ┌──────────────────┐   staff replies / done   ┌──────────┐
   │ needs_attention  │ ───────────────────────▶ │ handled  │
   └──────────────────┘                          └────┬─────┘
                                                       │ archived
                                                       ▼
                                                  ┌──────────┐
                                                  │  closed  │
                                                  └──────────┘
```

- `mode = ai` → autopilot replies. Staff pressing **Take over** (or sending a manual message) flips
  `mode = human`; the AI stops replying until handed back.
