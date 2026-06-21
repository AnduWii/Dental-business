# 13 · Disaster Recovery, RTO / RPO

## Targets
| Metric | Target (pilot) | How |
|---|---|---|
| **RPO** (max data loss) | ≤ 24h on Free; **minutes** with PITR | Supabase daily backups (Free) or Point-in-Time Recovery (Pro add-on) |
| **RTO** (time to restore) | ≤ 1 hour | Stateless app redeploys from Git in minutes; DB restore is the long pole |

The app tier is **stateless**, all state is in Supabase. Recovery = restore the database + redeploy
the code. There are no servers to rebuild.

## What can fail, and the response
| Failure | Blast radius | Recovery |
|---|---|---|
| Bad deploy | Site down/broken | Vercel → **Instant Rollback** to the previous deployment (seconds). |
| Code regression in Git | Future deploys | `git revert` + push; Vercel redeploys. |
| Accidental data deletion | One clinic/patient | Restore from Supabase backup / PITR to a point before the deletion. |
| Supabase outage | Auth + data + webhooks | Wait out provider; Twilio queues inbound webhooks with retries; no data created meanwhile. |
| Twilio outage | No texts/calls | Provider-level; conversations resume when restored. |
| Leaked service-role key | Full DB access | Rotate the key in Supabase, update Vercel env, redeploy; review `audit_log`. |

## Backups
- **Enable Supabase backups** (Free = daily automated). For a real RPO, enable **PITR** (Pro) so you
  can restore to any minute, recommended once you have paying clinics.
- Code + schema are version-controlled in Git (`supabase/migrations/*` is the schema of record).

## Restore runbook
1. **App broken:** Vercel → Deployments → previous green deploy → **Promote/Rollback**.
2. **Data loss:** Supabase → Database → Backups → restore the latest good backup (or PITR to the
   timestamp before the incident) into the project (or a new project, then repoint env vars).
3. **Re-point if restoring to a new project:** update `NEXT_PUBLIC_SUPABASE_URL` + keys in Vercel,
   redeploy, and re-add the Twilio webhook URLs if the domain changed.
4. **Verify:** run the manual end-to-end matrix in `docs/10`.
5. **Post-incident:** check `audit_log`, note RPO/RTO actually achieved, file follow-ups.

## Tested?
Rollback is exercised implicitly on every deploy. A **full DB restore drill** should be run once
before scaling past the first few clinics (documented, not yet performed).
