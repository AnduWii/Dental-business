// POST /api/conversations/:id/takeover
// Toggle who's driving the thread (ai ↔ human) and/or set its status.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireClinicMember } from "@/lib/auth";
import type { ConversationMode, ConversationStatus } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mode, status } = (await req.json()) as {
    mode?: ConversationMode;
    status?: ConversationStatus;
  };

  const admin = createAdminClient();
  const ctx = await requireClinicMember(admin, user.id, params.id);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const patch: Record<string, string> = {};
  if (mode === "ai" || mode === "human") patch.mode = mode;
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

  return NextResponse.json({ conversation: updated });
}
