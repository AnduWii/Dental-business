# 04 · Database Schema

Source of truth: [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
Postgres on Supabase. Every business table carries `clinic_id` and is protected by Row Level
Security.

## Entity relationships

```
auth.users ─1:1─ profiles ──*:1── clinics ─1:*─ patients
                                      │             │
                                      │             └─1:*─ conversations ─1:*─ messages
                                      │                        │
                                      ├─1:*─ call_events ───────┘ (optional link)
                                      └─1:*─ notifications ─────┘ (optional link)
```

## Enums

| Enum | Values |
|---|---|
| `user_role` | `owner`, `staff` |
| `subscription_status` | `pilot`, `active`, `paused`, `canceled` |
| `call_status` | `missed`, `completed`, `voicemail`, `failed` |
| `conversation_status` | `active`, `needs_attention`, `handled`, `closed` |
| `conversation_mode` | `ai`, `human` |
| `message_direction` | `inbound`, `outbound` |
| `message_sender` | `patient`, `ai`, `staff`, `system` |
| `urgency_level` | `unknown`, `low`, `medium`, `high`, `emergency` |
| `booking_intent` | `unknown`, `new_patient`, `existing_patient`, `reschedule`, `question`, `not_interested` |
| `notification_type` | `new_lead`, `emergency`, `new_message`, `missed_call` |
| `notification_channel` | `sms`, `email`, `dashboard` |
| `notification_status` | `pending`, `sent`, `failed` |

## Tables

### `clinics`, the tenant
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | clinic name, injected into texts |
| `timezone` | text | default `America/Toronto` |
| `twilio_number` | text unique | receives forwarded calls **and** sends texts (E.164) |
| `twilio_messaging_service_sid` | text | optional; recommended for 10DLC |
| `notify_phone` | text | front-desk mobile that gets paged (E.164) |
| `notify_email` | text | optional email page |
| `textback_message` | text | first auto-text; `{{clinic}}` placeholder |
| `ai_enabled` | bool | autopilot on/off |
| `ai_greeting` | text | optional override |
| `subscription_status` | enum | pilot → active → … |
| `pilot_ends_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | `updated_at` auto-maintained by trigger |

### `profiles`, links a Supabase auth user to a clinic
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid PK → `auth.users` | |
| `clinic_id` | uuid → `clinics` | null until onboarding |
| `full_name` | text | |
| `role` | enum | `owner` / `staff` |

### `patients`, the callers (one row per phone per clinic)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` | uuid → clinics | |
| `phone` | text | E.164 |
| `name` | text | filled once captured |
| `opted_out` | bool | set true on STOP, never text again |
| `first_seen_at` / `last_contact_at` | timestamptz | |
| | | **unique (`clinic_id`, `phone`)** |

### `conversations`, one SMS thread + the captured lead
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` / `patient_id` | uuid | |
| `status` | enum | active / needs_attention / handled / closed |
| `mode` | enum | `ai` (autopilot) / `human` (staff took over) |
| `caller_name` | text | **captured** |
| `reason` | text | **captured** |
| `urgency_level` | enum | **captured** |
| `booking_intent` | enum | **captured** |
| `intake_complete` | bool | true once the four fields are known |
| `summary` | text | optional |
| `last_message_at` | timestamptz | bumped by trigger on each message |

Indexes: `(clinic_id, status)`, `(clinic_id, last_message_at desc)`.

### `messages`, every SMS
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` / `conversation_id` | uuid | |
| `direction` | enum | inbound / outbound |
| `sender` | enum | patient / ai / staff / system |
| `body` | text | |
| `twilio_sid` | text **unique** | dedupes retried webhooks + tracks delivery |
| `status` | text | queued / sent / delivered / failed / received |

Index: `(conversation_id, created_at)`.

### `call_events`, the missed-call audit log (the sales proof)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` / `patient_id` / `conversation_id` | uuid | |
| `twilio_call_sid` | text **unique** | idempotency |
| `from_number` / `to_number` / `forwarded_from` | text | |
| `status` | enum | `missed` for V1 |
| `textback_sent` | bool | |
| `occurred_at` | timestamptz | |

Index: `(clinic_id, occurred_at desc)`.

### `notifications`, clinic alert feed + send log
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `clinic_id` / `conversation_id` | uuid | |
| `type` | enum | new_lead / emergency / new_message / missed_call |
| `channel` | enum | `dashboard` rows = the feed; `sms`/`email` rows = send logs |
| `title` / `body` | text | |
| `read_at` | timestamptz | null = unread |
| `status` | enum | pending / sent / failed |

Index: `(clinic_id, created_at desc)`.

## Security model (RLS)
- `user_clinic_ids()` is a `SECURITY DEFINER` function returning the caller's clinic(s) without
  tripping recursive RLS.
- Each table has a **SELECT** policy: `clinic_id in (select user_clinic_ids())` (and `profiles`
  exposes only the user's own row).
- **No client write policies.** All inserts/updates happen server-side with the service-role key
  after an explicit membership check (`requireClinicMember`, server actions). This is the single
  most important safety property of the schema.

## Realtime
`messages`, `conversations`, and `notifications` are added to the `supabase_realtime` publication so
the dashboard updates live.
