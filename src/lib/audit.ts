// Append-only audit logging. Best-effort: never throws, never blocks the
// request it's recording. Writes via the service role to the tamper-resistant
// audit_log table.
import { createAdminClient } from "@/lib/supabase/admin";

interface AuditEntry {
  clinicId?: string | null;
  actorEmail?: string | null;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      clinic_id: entry.clinicId ?? null,
      actor_email: entry.actorEmail ?? "system",
      action: entry.action,
      target: entry.target ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    console.error("[audit] failed to record", entry.action, err);
  }
}
