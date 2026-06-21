# 14 - Information Security Policy (internal)

> Internal policy. Not customer-facing, but referenced by the DPA's Annex C and expected by a
> diligence reviewer. Plain English on purpose so it can actually be followed by a small team.
> Owner: Andrew Li (Catchline Services Inc.). Last updated June 21, 2026.

Catchline handles personal health information (a caller saying "my tooth hurts" or "I cracked a
crown" is health information under PHIPA). That raises the bar above ordinary software security.
This policy records the controls and procedures we keep in place.

## 1. Access control policy
- Production data is reached only through Supabase Row Level Security and the server-side service
  role. The service-role key lives only in server environment variables, never in the browser or
  the repo.
- Access to the Supabase project, Vercel project, and Twilio account is limited to people who need
  it, protected by strong, unique passwords and multi-factor authentication.
- Least privilege: each person and service gets the minimum access needed, and no more.

## 2. Employee and contractor access
- Today the team is the founder. As people are added, access is granted per role, recorded, and
  reviewed.
- Anyone with access agrees in writing to keep information confidential.
- Access is removed promptly when someone leaves or no longer needs it.

## 3. Breach response plan
- If a breach of security safeguards is suspected, we contain it, assess what data is involved, and
  record what happened.
- We notify each affected Clinic without undue delay and no later than 72 hours after discovery,
  with the information they need to meet their PHIPA and PIPEDA obligations.
- We document the cause and the fix so the same issue does not recur.

## 4. Backup policy
- The database is hosted on Supabase, which provides managed backups. On the paid tier we enable
  daily backups and point-in-time recovery.
- Recovery targets and the disaster-recovery runbook are in docs/13-disaster-recovery.md.

## 5. Retention and deletion procedures
- We hold the minimum data needed (see docs/12-compliance-privacy.md).
- Closed conversations are purged after about 12 months by the scheduled pg_cron job
  (purge_old_conversations). Erasure on request uses erase_patient and erase_clinic.

## 6. Incident and audit logging
- Sensitive actions (staff replies, takeovers, clinic creation, settings changes) are written to an
  append-only audit log that cannot be altered or deleted, even by the service role.
- Security-relevant incidents are logged and reviewed.

## 7. Vendor and sub-processor review
- Before engaging a sub-processor we check that it offers appropriate security and data terms, and
  we record it in the DPA's Annex B.
- The current sub-processors are Supabase, Vercel, Twilio, OpenAI/Anthropic, and (optionally)
  Resend.

## 8. Review cadence
- This policy is reviewed at least yearly, and whenever the architecture or sub-processors change.

## Roadmap (as the business grows)
- Before 50+ clinics: a full PHIPA review with Ontario privacy counsel, a formal written security
  program, a tested incident-response plan, documented vendor risk assessments, and cyber-liability
  insurance.
