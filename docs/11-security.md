# 11 · Security

## Threat model (what we actually defend against)
| Threat | Control |
|---|---|
| Spoofed Twilio webhooks | `validateTwilioSignature()` rejects unsigned/forged requests in production. |
| Cross-tenant data access | Postgres **RLS** on every table; clients only ever read their own clinic. |
| Leaked client key abuse | The browser only has the **anon** key; RLS makes it useless beyond the user's clinic. The **service-role** key is server-only. |
| SQL injection | Supabase client uses parameterized queries exclusively. |
| XSS | React escapes all interpolated values; no `dangerouslySetInnerHTML`; TwiML output escaped. |
| Clickjacking | `X-Frame-Options: DENY` + headers in `next.config.mjs`. |
| Runaway cost / SMS bombing | Auto-reply cap per conversation (`ratelimit.ts`); Twilio STOP handling. |
| Tampering with history | `audit_log` is append-only (DB trigger blocks UPDATE/DELETE). |
| Secret leakage | Secrets in env only; `.env*` gitignored; CI has no secret echoing; GitHub secret scanning (enable in repo settings). |

## Secrets
- `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_AUTH_TOKEN`, `OPENAI_API_KEY` are **server-only** and never
  referenced in client components.
- Only `NEXT_PUBLIC_*` values reach the browser, and those are designed to be public.
- Rotation: rotate Twilio auth token and Supabase keys from their dashboards; update Vercel env +
  redeploy. No secrets are baked into the repo.

## HTTP security headers (`next.config.mjs`)
`Strict-Transport-Security` (2y, preload), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy` (camera/mic/geo off), `poweredByHeader: false`.

> **Deferred:** a strict `Content-Security-Policy`. Next.js inline/runtime scripts make a correct
> nonce-based CSP non-trivial; it's the top next-step security item before scaling beyond pilots.

## AuthN/AuthZ
- Passwordless magic link **and** email/password via Supabase Auth.
- Route protection in `middleware.ts`; server-side guards in `getDashboardContext` and
  `requireClinicMember`.
- Platform admin is an allow-list (`DEFAULT_ADMIN_EMAILS` + `ADMIN_EMAILS`), checked server-side.

## Webhook hardening
- Signature validation, idempotency (unique `CallSid`/`MessageSid`), and handled-error responses
  that return empty TwiML so Twilio doesn't retry-storm.

## Operational
- Dependency scanning: Dependabot + `npm audit` in CI.
- Recommended GitHub settings (see go-live): branch protection on `main`, required CI checks,
  Dependabot alerts, secret scanning + push protection.
