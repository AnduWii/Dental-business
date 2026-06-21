# Architecture Decision Records

Short records of the significant, hard-to-reverse decisions and *why* we made them. Format:
Context → Decision → Consequences. Newest decisions can supersede older ones.

---

## ADR-0001, One Next.js app on Vercel (no separate backend)
**Context:** Solo/student builder, 30-day timeline, must reach paying clinics fast.
**Decision:** Use Next.js App Router for the marketing site, dashboard, **and** backend (route
handlers). Deploy on Vercel. No separate API service.
**Consequences:** One repo, one deploy, one mental model; trivial HTTPS + env + logs. Coupled to
Vercel/serverless conventions (acceptable). Heavy background jobs would need a queue later.

## ADR-0002, Supabase Postgres with RLS; writes via service role
**Context:** Need DB + auth + realtime + multi-tenant isolation cheaply.
**Decision:** Supabase. Clients **read** through Row Level Security scoped by `clinic_id`; **all
writes** happen server-side with the service-role key after an explicit membership check.
**Consequences:** Hard tenant isolation with simple SELECT-only client policies; one clear write
path. The service-role key must never reach the client (enforced by module boundaries).

## ADR-0003, Narrow AI intake with a deterministic fallback
**Context:** The business doc says "no AI receptionist for V1," but we want conversational capture,
and reliability is paramount.
**Decision:** A constrained intake assistant that only collects name/reason/urgency/booking-intent
and never books, prices, or gives clinical advice. Provider-agnostic via env; **deterministic
scripted fallback** when no key/timeout/error. Emergencies escalate to 911/ER.
**Consequences:** Works even with zero AI configured; predictable cost and behavior; safe. Less
"magical" than an open-ended bot, intentionally.

## ADR-0004, Missed-call detection via conditional call forwarding
**Context:** The doc flagged "how does the system know about missed calls?" as unresolved, and we
must stay non-invasive (clinics keep their number/staff/workflow).
**Decision:** The clinic forwards unanswered/busy calls to a provisioned Twilio number; the voice
webhook fires the text-back. No number porting, no PBX replacement.
**Consequences:** Easy, reversible onboarding; works with most carriers/VoIP. Depends on the clinic
configuring forwarding; caller-ID nuances vary by carrier (documented in `docs/08`).

## ADR-0005, Manual billing & hand-onboarding for founding clinics
**Context:** Need revenue fast without building billing.
**Decision:** No Stripe in V1. First clinics are hand-onboarded and invoiced manually after the
14-day pilot converts at $150/mo.
**Consequences:** Zero billing code to maintain now; founder does manual invoicing (fine at <10
clinics). Stripe + self-serve is a clear V2 item.

## ADR-0006, Realtime-by-refresh instead of hand-managed client cache
**Context:** Dashboard must reflect new leads instantly; reliability > cleverness.
**Decision:** Supabase realtime subscriptions trigger `router.refresh()` (server re-render) rather
than maintaining a parallel client-side store.
**Consequences:** Far fewer state-sync bugs; always consistent with the DB. Slightly more
server work per update, negligible at pilot scale.
