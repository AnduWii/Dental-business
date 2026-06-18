// POST /api/conversations/:id/takeover
// Toggle who's driving the thread (ai ↔ human) and/or set its status.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicMember } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { oneOf } from "@/lib/validation";
import type { ConversationMode, ConversationStatus } from "@/lib/types";

const MODES: ConversationMode[] = ["ai", "human"];
const STATUSES: ConversationStatus[] = ["active", "needs_attention", "handled", "closed"];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = (await req.json().catch(() => ({}))) as { mode?: unknown; status?: unknown };
  const mode = oneOf(raw.mode, MODES);
  const status = oneOf(raw.status, STATUSES);

  const admin = createAdminClient();
  const ctx = await requireClinicMember(admin, user.id, params.id);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const patch: Record<string, string> = {};
  if (mode) patch.mode = mode;
  if (status) patch.status = status;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: updated } = await admin
    .from("conversations")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  await logAudit({
    clinicId: ctx.clinic.id,
    actorEmail: user.email,
    action: "conversation.takeover",
    target: params.id,
    metadata: patch,
  });

  return NextResponse.json({ conversation: updated });
}
