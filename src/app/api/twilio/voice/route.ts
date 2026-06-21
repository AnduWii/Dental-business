// =====================================================================
// POST /api/twilio/voice
//
// Fires when a clinic's UNANSWERED call is forwarded to its Twilio number
// (the clinic sets carrier "forward on no-answer/busy" → this number).
// We log the missed call, text the caller back instantly, open a
// conversation, then hang up the voice leg.
// =====================================================================
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms, validateTwilioSignature, missedCallTwiml } from "@/lib/twilio";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const xml = (body: string) =>
  new NextResponse(body, { headers: { "Content-Type": "text/xml" } });

export async function POST(req: NextRequest) {
  // --- parse + verify it's really Twilio ---
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = typeof v === "string" ? v : ""));

  const url = `${env.appUrl()}/api/twilio/voice`;
  const valid = validateTwilioSignature(req.headers.get("x-twilio-signature"), url, params);
  if (!valid && process.env.NODE_ENV === "production") {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const caller = params.From; // original patient's number (preserved by forwarding)
  const twilioNumber = params.To; // the clinic's Catchline number
  const callSid = params.CallSid;
  const forwardedFrom = params.ForwardedFrom || null; // the clinic line that forwarded

  const admin = createAdminClient();

  // --- which clinic owns this number? ---
  const { data: clinic } = await admin
    .from("clinics")
    .select("*")
    .eq("twilio_number", twilioNumber)
    .maybeSingle();

  if (!clinic) {
    // Unknown number — be polite and hang up.
    return xml(missedCallTwiml("our office"));
  }

  // --- idempotency: same CallSid already handled? ---
  if (callSid) {
    const { data: existing } = await admin
      .from("call_events")
      .select("id, textback_sent")
      .eq("twilio_call_sid", callSid)
      .maybeSingle();
    if (existing?.textback_sent) return xml(missedCallTwiml(clinic.name));
  }

  // --- upsert the patient ---
  const { data: patient } = await admin
    .from("patients")
    .upsert(
      { clinic_id: clinic.id, phone: caller, last_contact_at: new Date().toISOString() },
      { onConflict: "clinic_id,phone" },
    )
    .select("*")
    .single();

  // --- reuse an open conversation or start a new one ---
  let conversationId: string | null = null;
  const { data: openConvo } = await admin
    .from("conversations")
    .select("id")
    .eq("clinic_id", clinic.id)
    .eq("patient_id", patient!.id)
    .in("status", ["active", "needs_attention"])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openConvo) {
    conversationId = openConvo.id;
  } else {
    const { data: convo } = await admin
      .from("conversations")
      .insert({
        clinic_id: clinic.id,
        patient_id: patient!.id,
        status: "active",
        mode: clinic.ai_enabled ? "ai" : "human",
      })
      .select("id")
      .single();
    conversationId = convo!.id;
  }

  // --- log the missed call (audit + sales proof) ---
  await admin.from("call_events").insert({
    clinic_id: clinic.id,
    patient_id: patient!.id,
    conversation_id: conversationId,
    twilio_call_sid: callSid || null,
    from_number: caller,
    to_number: twilioNumber,
    forwarded_from: forwardedFrom,
    status: "missed",
    textback_sent: false,
  });

  // --- text the caller back instantly (unless they've opted out) ---
  if (!patient!.opted_out) {
    const body = clinic.textback_message.replaceAll("{{clinic}}", clinic.name);
    try {
      const msg = await sendSms({
        to: caller,
        from: clinic.twilio_number!,
        messagingServiceSid: clinic.twilio_messaging_service_sid || undefined,
        body,
      });
      await admin.from("messages").insert({
        clinic_id: clinic.id,
        conversation_id: conversationId,
        direction: "outbound",
        sender: "system",
        body,
        twilio_sid: msg.sid,
        status: msg.status,
      });
      await admin
        .from("call_events")
        .update({ textback_sent: true })
        .eq("twilio_call_sid", callSid);
    } catch (err) {
      console.error("[voice] text-back failed:", err);
    }
  }

  // --- surface in the dashboard feed (no SMS page yet — that waits for a reply) ---
  await admin.from("notifications").insert({
    clinic_id: clinic.id,
    conversation_id: conversationId,
    type: "missed_call",
    channel: "dashboard",
    title: "Missed call",
    body: `Missed call from ${caller}. Text-back sent.`,
    status: "sent",
  });

  return xml(missedCallTwiml(clinic.name));
}
