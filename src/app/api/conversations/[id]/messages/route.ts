// POST /api/conversations/:id/messages
// A staff member sends a manual SMS to the patient from the dashboard.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio";
import { requireClinicMember } from "@/lib/auth";
import { sanitizeText, LIMITS } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  const text = sanitizeText(body, LIMITS.reply);
  if (!text) return NextResponse.json({ error: "Message body required" }, { status: 400 });

  const admin = createAdminClient();
  const ctx = await requireClinicMember(admin, user.id, id);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { clinic, conversation } = ctx;

  const { data: patient } = await admin
    .from("patients")
    .select("phone, opted_out")
    .eq("id", conversation.patient_id)
    .single();

  if (patient?.opted_out) {
    return NextResponse.json({ error: "Patient has opted out of texts" }, { status: 409 });
  }

  try {
    const msg = await sendSms({
      to: patient!.phone,
      from: clinic.twilio_number!,
      messagingServiceSid: clinic.twilio_messaging_service_sid || undefined,
      body: text,
    });
    const { data: stored } = await admin
      .from("messages")
      .insert({
        clinic_id: clinic.id,
        conversation_id: conversation.id,
        direction: "outbound",
        sender: "staff",
        body: text,
        twilio_sid: msg.sid,
        status: msg.status,
      })
      .select("*")
      .single();

    // A human just replied → flip to human mode and mark handled.
    await admin
      .from("conversations")
      .update({ mode: "human", status: "handled" })
      .eq("id", conversation.id);

    await logAudit({
      clinicId: clinic.id,
      actorEmail: user.email,
      action: "staff.reply",
      target: conversation.id,
    });

    return NextResponse.json({ message: stored });
  } catch (err) {
    console.error("[messages] staff send failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }
}
