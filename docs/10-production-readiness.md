# 10 · Production-Readiness Checklist

Honest status of each hardening item for **Catchline V1**. Legend: ✅ Done · 🟡 Partial / appropriate
for stage · ⏳ Deferred (with reason). This is a pre-revenue pilot for one-location dental clinics,
so the bar is "secure, reliable, compliant for the data we hold" — not "Fortune-500 SRE." Items are
deferred only when implementing them now would be theater rather than risk reduction.

| # | Item | Status | What we did / where |
|---|---|---|---|
| 1 | Input sanitization & injection prevention | ✅ | `src/lib/validation.ts` (length caps, control-char stripping, E.164/email/enum guards) wired into webhooks, API routes, and server actions. Supabase queries are parameterized (no SQLi); React escapes JSX (no stored XSS); TwiML output is escaped. |
| 2 | AuthN, AuthZ, roles, permissions | ✅ | Supabase Auth (password + magic link). Postgres **RLS** on every table; `owner`/`staff` roles; founder **admin allow-list** (`src/lib/admin.ts`). API routes verify clinic membership (`requireClinicMember`). |
| 3 | Session management & token expiry | 🟡 | Supabase JWT + refresh-token rotation; sessions refreshed in `middleware.ts`. JWT/refresh expiry is a Supabase setting — see go-live steps. |
| 4 | Secrets management | ✅ | All secrets in env vars; **service-role key is server-only**; `.env*` gitignored; nothing secret in `NEXT_PUBLIC_*`. Vercel "Sensitive" flag for the service-role key. |
| 5 | HTTPS / TLS / cert rotation | ✅ | Vercel terminates TLS with auto-renewing managed certs. **HSTS** + security headers in `next.config.mjs`. |
| 6 | Rate limiting & abuse prevention | 🟡 | Twilio **signature validation**; **auto-reply cost cap** per conversation (`src/lib/ratelimit.ts`); STOP/opt-out. Edge/IP rate-limiting (Upstash or Vercel Firewall) deferred until traffic warrants. |
| 7 | Dependency scanning & patching | ✅ | **Dependabot** (`.github/dependabot.yml`) + `npm audit` in CI. Triaged the full alert backlog: upgraded **Next.js 14.2.35 → 15.5.19** (clears the cache-poisoning/SSRF/DoS/XSS advisories), **Vitest 2 → 4** (clears the dev-only vite/esbuild criticals), and pinned **postcss ≥ 8.5.10** via `overrides`. `npm audit` is now **0 vulnerabilities**. |
| 8 | Multi-tenancy & data isolation | ✅ | `clinic_id` on every row + RLS scoped via `user_clinic_ids()`. Clients read through RLS; all writes server-side via service role **after a membership check**. |
| 9 | PII handling, retention, deletion | ✅ | Minimal PII (name, phone, reason). Erasure + retention functions in `0002_audit_retention.sql` (`erase_patient`, `erase_clinic`, `purge_old_conversations`). See `docs/12`. |
| 10 | Regulatory compliance (GDPR/HIPAA) | 🟡 | Real regime for Ontario is **PIPEDA/PHIPA + CASL**; GDPR-style erasure/access supported. HIPAA generally N/A (not a US covered entity). Full analysis in `docs/12-compliance-privacy.md`. **Public privacy policy at `/privacy` + clinic DPA at `/dpa`** (counsel review pending). |
| 11 | Audit trails & tamper-evident logging | ✅ | Append-only `audit_log` with a DB trigger that **blocks UPDATE/DELETE for everyone, including the service role**. Logged: staff replies, takeovers, clinic create, settings changes. |
| 12 | Unit / integration / e2e tests | 🟡 | Unit suite (Vitest, 27 tests). Integration/e2e (Playwright + mocked Twilio/Supabase) documented as next step; manual end-to-end matrix in `docs/07`/below. |
| 13 | Regression tests | ✅ | The unit suite runs in **CI on every push & PR** (`.github/workflows/ci.yml`). |
| 14 | Load & stress testing | ⏳ | Serverless functions autoscale; DB indexed. A **k6 plan** is documented below; not executed pre-revenue (no meaningful load yet, and it costs Twilio/AI spend to simulate). |
| 15 | Chaos engineering & resilience testing | ⏳ | Baseline resilience built in (AI fallback, retries, idempotency, graceful boot). Formal fault-injection is out of scope for a single-node serverless MVP; revisit at multi-clinic scale. |
| 16 | Coverage thresholds enforced in CI | ✅ | Vitest v8 coverage gate at **80% lines/stmts/funcs, 70% branches** on core logic; CI fails on regression. |
| 17 | Code review process & standards | ✅ | PR-based flow; CI gates (typecheck, lint, test, build) must pass. Branch-protection + review steps in go-live. ESLint + TS strict enforce standards. |
| 18 | Error handling & graceful degradation | ✅ | AI degrades to a deterministic script; webhooks catch+log and return empty TwiML (no Twilio retry storms); the public site boots with zero config. |
| 19 | Retry with backoff + idempotency | ✅ | `src/lib/retry.ts` (`withRetry`, `fetchWithTimeout`) on SMS + AI. Idempotency via unique constraints on `call_events.twilio_call_sid` and `messages.twilio_sid`. |
| 20 | Circuit breakers & fallback | 🟡 | The deterministic intake fallback **is** the breaker for the LLM (timeout → retry → fallback). A formal breaker library is unnecessary at this scale. |
| 21 | Concurrency & race-condition prevention | ✅ | Patient `upsert ... onConflict`; unique `twilio_sid` dedupes retried webhooks. One rare dup-conversation race is documented & low-impact (see `docs/02`). |
| 22 | Caching strategy & invalidation | ✅ | Dashboard is `force-dynamic` (always fresh) + Supabase realtime; `revalidatePath` after writes; static assets via Vercel CDN. Details below. |
| 23 | RTO & RPO | ✅ | Targets defined in `docs/13-disaster-recovery.md` (RPO ≤ 24h free / minutes with PITR; RTO ≤ 1h). |
| 24 | Disaster recovery plan | ✅ | Runbook in `docs/13-disaster-recovery.md`. |
| 25 | Accessibility | 🟡 | Labels + `aria` + roles on forms, semantic HTML, visible focus rings, `lang`, muted high-contrast palette. Full WCAG 2.1 AA audit (screen-reader pass, axe in CI) is the next step. |
| 26 | Architecture diagrams & ADRs | ✅ | `docs/02-architecture.md` + ADRs in `docs/adr/`. |

## Caching strategy (detail)
- **Dashboard data** must never be stale (a missed lead is money), so dashboard routes are
  `force-dynamic` and complemented by **Supabase realtime** push. We do **not** cache it.
- **Writes** call `revalidatePath()` to refresh server-rendered views immediately.
- **Static assets** (JS/CSS) are content-hashed and cached at Vercel's CDN edge indefinitely;
  invalidation is automatic on deploy.
- **LLM calls** are not cached (each conversation turn is unique).

## Load testing plan (when it's worth running)
- Tool: **k6** against a staging deploy with a **Twilio test number** + a mock AI key.
- Scenarios: burst of N concurrent missed-call webhooks; sustained inbound SMS; dashboard reads.
- Watch: function cold-starts, Supabase connection limits, AI latency, Twilio 429s.
- Trigger to actually run it: before onboarding clinic #10, or any multi-location clinic.

## Manual end-to-end test matrix (run before each pilot)
1. Missed call → text-back received within seconds.
2. Reply → AI asks name → reason → urgency → closing; lead appears in dashboard.
3. Emergency phrase → escalation message + clinic paged.
4. `STOP` → opt-out; no further texts; composer disabled.
5. Staff "Take over" → manual reply sends; AI stops.
6. Duplicate Twilio webhook (same SID) → no duplicate message/text-back.
7. Auto-reply cap → conversation flips to "needs a human".
