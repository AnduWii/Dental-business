// =====================================================================
// POST /api/twilio/sms
//
// Fires on every inbound text from a patient. We store it, and, unless a
// human has taken over, run the AI intake, reply, capture the lead, and
// page the clinic when there's something worth acting on.
// =====================================================================
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms, validateTwilioSignature, EMPTY_TWIML } from "@/lib/twilio";
import { runIntake, type IntakeTurn } from "@/lib/ai/intake";
import { notifyClinic } from "@/lib/notify";
import { autoReplyLimitReached } from "@/lib/ratelimit";
import { sanitizeText, LIMITS } from "@/lib/validation";
import { env } from "@/lib/env";
import type { Clinic, Conversation, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

const xml = (body: string) =>
  new NextResponse(body, { headers: { "Content-Type": "text/xml" } });

const STOP_WORDS = /^(stop|stopall|unsubscribe|cancel|end|quit)$/i;
const START_WORDS = /^(start|yes|unstop)$/i;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = typeof v === "string" ? v : ""));

  const url = `${env.appUrl()}/api/twilio/sms`;
  const valid = validateTwilioSignature(req.headers.get("x-twilio-signature"), url, params);
  if (!valid && process.env.NODE_ENV === "production") {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = params.From; // patient
  const to = params.To; // clinic Catchline number
  const body = sanitizeText(params.Body, LIMITS.smsBody);
  const messageSid = params.MessageSid || params.SmsSid || null;

  const admin = createAdminClient();

  const { data: clinic } = await admin
    .from("clinics")
    .select("*")
    .eq("twilio_number", to)
    .maybeSingle<Clinic>();
  if (!clinic) return xml(EMPTY_TWIML);

  // --- patient ---
  const { data: patient } = await admin
    .from("patients")
    .upsert(
      { clinic_id: clinic.id, phone: from, last_contact_at: new Date().toISOString() },
      { onConflict: "clinic_id,phone" },
    )
    .select("*")
    .single();

  // --- opt-out / opt-in handling (CASL / TCPA compliance) ---
  if (STOP_WORDS.test(body) || (params.OptOutType || "").toUpperCase() === "STOP") {
    await admin.from("patients").update({ opted_out: true }).eq("id", patient!.id);
    return xml(EMPTY_TWIML); // Twilio sends the compliance confirmation itself
  }
  if (START_WORDS.test(body) && patient!.opted_out) {
    await admin.from("patients").update({ opted_out: false }).eq("id", patient!.id);
  }

  // --- find or open a conversation ---
  let conversation: Conversation;
  const { data: openConvo } = await admin
    .from("conversations")
    .select("*")
    .eq("clinic_id", clinic.id)
    .eq("patient_id", patient!.id)
    .in("status", ["active", "needs_attention", "handled"])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle<Conversation>();

  if (openConvo) {
    conversation = openConvo;
  } else {
    const { data: created } = await admin
      .from("conversations")
      .insert({
        clinic_id: clinic.id,
        patient_id: patient!.id,
        status: "active",
        mode: clinic.ai_enabled ? "ai" : "human",
      })
      .select("*")
      .single<Conversation>();
    conversation = created!;
  }

  // --- store inbound message (dedupe on Twilio SID) ---
  const { error: insertErr } = await admin.from("messages").insert({
    clinic_id: clinic.id,
    conversation_id: conversation.id,
    direction: "inbound",
    sender: "patient",
    body,
    twilio_sid: messageSid,
    status: "received",
  });
  // Unique violation => Twilio retried a delivered webhook; stop here.
  if (insertErr && insertErr.code === "23505") return xml(EMPTY_TWIML);

  // --- if a human took over, just page them; never auto-reply ---
  if (conversation.mode === "human" || !clinic.ai_enabled) {
    await admin
      .from("conversations")
      .update({ status: "needs_attention" })
      .eq("id", conversation.id);
    await notifyClinic({
      clinic,
      conversationId: conversation.id,
      type: "new_message",
      title: "New patient reply",
      body: `${conversation.caller_name || patient!.name || from}: ${body.slice(0, 140)}`,
    });
    return xml(EMPTY_TWIML);
  }

  // --- abuse / cost guard: if this thread has burned through the auto-reply
  //     budget, stop the AI and hand it to a human ---
  if (await autoReplyLimitReached(admin, conversation.id)) {
    await admin
      .from("conversations")
      .update({ status: "needs_attention", mode: "human" })
      .eq("id", conversation.id);
    await notifyClinic({
      clinic,
      conversationId: conversation.id,
      type: "new_message",
      title: "Conversation needs a human",
      body: `Auto-reply limit reached for ${conversation.caller_name || from}. Please take over.`,
    });
    return xml(EMPTY_TWIML);
  }

  // --- AI autopilot: build history, run intake ---
  const { data: history } = await admin
    .from("messages")
    .select("direction, body")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(24);

  const turns: IntakeTurn[] = (history || []).map((m: Pick<Message, "direction" | "body">) => ({
    role: m.direction === "inbound" ? "patient" : "assistant",
    body: m.body,
  }));

  const result = await runIntake({
    clinicName: clinic.name,
    history: turns,
    current: {
      caller_name: conversation.caller_name,
      reason: conversation.reason,
      urgency_level: conversation.urgency_level,
      booking_intent: conversation.booking_intent,
    },
  });

  // --- send the AI reply ---
  try {
    const msg = await sendSms({
      to: from,
      from: clinic.twilio_number!,
      messagingServiceSid: clinic.twilio_messaging_service_sid || undefined,
      body: result.reply,
    });
    await admin.from("messages").insert({
      clinic_id: clinic.id,
      conversation_id: conversation.id,
      direction: "outbound",
      sender: "ai",
      body: result.reply,
      twilio_sid: msg.sid,
      status: msg.status,
    });
  } catch (err) {
    console.error("[sms] AI reply send failed:", err);
  }

  // --- persist captured lead fields ---
  const wasComplete = conversation.intake_complete;
  const newStatus =
    result.emergency || result.fields.intake_complete ? "needs_attention" : "active";

  await admin
    .from("conversations")
    .update({
      caller_name: result.fields.caller_name,
      reason: result.fields.reason,
      urgency_level: result.fields.urgency_level,
      booking_intent: result.fields.booking_intent,
      intake_complete: result.fields.intake_complete,
      status: newStatus,
    })
    .eq("id", conversation.id);

  if (result.fields.caller_name && !patient!.name) {
    await admin.from("patients").update({ name: result.fields.caller_name }).eq("id", patient!.id);
  }

  // --- page the clinic on the events that matter ---
  if (result.emergency) {
    await notifyClinic({
      clinic,
      conversationId: conversation.id,
      type: "emergency",
      title: "Possible emergency",
      body: `${result.fields.caller_name || from}: ${result.fields.reason || body.slice(0, 140)}`,
    });
  } else if (result.fields.intake_complete && !wasComplete) {
    const intent = result.fields.booking_intent.replace("_", " ");
    await notifyClinic({
      clinic,
      conversationId: conversation.id,
      type: "new_lead",
      title: "New patient lead",
      body: `${result.fields.caller_name || from}, ${result.fields.reason || "wants to talk"} (${intent})`,
    });
  }

  return xml(EMPTY_TWIML);
}
