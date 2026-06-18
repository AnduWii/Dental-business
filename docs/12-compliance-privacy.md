# 12 · Compliance & Privacy

> Not legal advice. This documents the product's data practices and the regimes that apply so a
> founder + counsel can finish the picture before scaling.

## Which laws actually apply
The target market (RCDSO references in the business doc) is **Ontario, Canada**, so the governing
regimes are:
- **PIPEDA** (federal private-sector privacy) and **PHIPA** (Ontario health-information privacy).
- **CASL** (anti-spam) for the SMS messaging.
- **GDPR** applies only if serving EU residents; we support its core data-subject rights anyway.
- **HIPAA** is **US** law; Recall is generally **not** a HIPAA covered entity or business associate
  for Ontario clinics. If you ever sell to US dental practices, you'd need a BAA and a HIPAA review
  before handling PHI — treat that as a gating decision, not a default.

## PII / PHI inventory (data minimization)
We deliberately hold the **minimum**:
| Data | Where | Why |
|---|---|---|
| Caller phone number | `patients.phone` | to text them back |
| Caller name | `patients.name` / `conversations.caller_name` | so staff can help them |
| Reason for calling | `conversations.reason` + `messages.body` | intake; **may contain health info** |
| Urgency / booking intent | `conversations` | triage |
| Staff email | `auth.users` / `profiles` | login |

We do **not** store clinical records, treatment history, insurance, or payment data. Because
"reason for calling" can contain health information, we treat conversation data as sensitive.

## CASL (consent for texts)
- The patient **calls the clinic first** → the immediate text-back is a response to their inquiry
  (implied consent), and messages are transactional/service, not promotional.
- **Opt-out is honored**: `STOP` sets `patients.opted_out`; we never text opted-out numbers and the
  dashboard composer is disabled for them. `START` re-subscribes. Twilio also enforces STOP/HELP.
- Every message names the clinic (sender identification).

## Data-subject rights (GDPR/PIPEDA/PHIPA)
- **Access/portability:** all of a patient's data is reachable by phone within a clinic; export via
  SQL on request.
- **Erasure:** `select erase_patient('<clinic_id>', '+1...')` deletes a patient and cascades their
  conversations/messages/calls. `select erase_clinic('<clinic_id>')` removes an entire clinic.
- **Retention:** `select purge_old_conversations(365)` deletes closed conversations older than a
  year. Schedule it (Supabase `pg_cron`) — see go-live. Default policy: **purge closed
  conversations after 12 months**; tune per clinic agreement.

## Data residency & sub-processors
- **Supabase** region is chosen at project creation (e.g., `us-east-1`). For Canadian data-residency
  requirements, create the project in a **Canadian region** (`ca-central-1`) — decide before
  onboarding clinics with residency clauses.
- Sub-processors: Supabase (DB/auth), Vercel (hosting), Twilio (SMS/voice), OpenAI/Anthropic (intake
  text), optionally Resend (email). List these in your clinic DPA.

## Recommended before first paying clinic
1. A one-page **privacy policy** + **clinic data-processing agreement** (what you collect, why,
   retention, sub-processors, erasure).
2. Decide **data residency** (Canadian Supabase region if required).
3. Confirm the **AI provider's data-use terms** (ensure inputs aren't used for training; both
   OpenAI API and Anthropic API default to no-training for API data, but confirm and document).
