// =====================================================================
// AI intake engine
//
// One narrow job: hold a short, friendly SMS conversation that captures
//   1. the caller's name
//   2. the reason for calling
//   3. how urgent it is
//   4. whether they want to book
// ...then hand off to the human front desk. This is NOT an AI receptionist:
// it never books, never quotes prices, never gives clinical advice.
//
// It is provider-agnostic (OpenAI by default, Anthropic optional) and
// degrades to a deterministic scripted flow when no API key is configured
// or the LLM call fails — so the product keeps working no matter what.
// =====================================================================
import { env } from "@/lib/env";
import type { BookingIntent, UrgencyLevel } from "@/lib/types";

export interface IntakeTurn {
  role: "patient" | "assistant";
  body: string;
}

export interface IntakeContext {
  clinicName: string;
  history: IntakeTurn[];
  current: {
    caller_name: string | null;
    reason: string | null;
    urgency_level: UrgencyLevel;
    booking_intent: BookingIntent;
  };
}

export interface IntakeResult {
  reply: string;
  fields: {
    caller_name: string | null;
    reason: string | null;
    urgency_level: UrgencyLevel;
    booking_intent: BookingIntent;
    intake_complete: boolean;
  };
  emergency: boolean;
}

const URGENCY_VALUES: UrgencyLevel[] = ["unknown", "low", "medium", "high", "emergency"];
const INTENT_VALUES: BookingIntent[] = [
  "unknown",
  "new_patient",
  "existing_patient",
  "reschedule",
  "question",
  "not_interested",
];

// Safety net: flag obvious dental emergencies regardless of what the model says.
const EMERGENCY_PATTERNS =
  /(can'?t breathe|cannot breathe|trouble breathing|swelling.*(throat|eye|breath|swallow)|knocked out|knocked-out|severe bleeding|won'?t stop bleeding|broke my jaw|broken jaw|face is swollen|unconscious|passed out)/i;

function detectEmergencyText(text: string): boolean {
  return EMERGENCY_PATTERNS.test(text);
}

function systemPrompt(clinicName: string): string {
  return [
    `You are the text-message intake assistant for ${clinicName}, a dental clinic.`,
    `A patient just called and no one could pick up, so you're texting them back.`,
    ``,
    `YOUR ONLY GOAL is to collect, conversationally and warmly:`,
    `  1. the caller's name`,
    `  2. the reason they're calling`,
    `  3. how urgent it is`,
    `  4. whether they'd like to book an appointment`,
    `Then tell them a team member will text or call them back shortly.`,
    ``,
    `RULES:`,
    `- You are texting. Keep every reply short (1-2 sentences), friendly, human.`,
    `- Ask ONE thing at a time. Don't interrogate.`,
    `- NEVER give medical or dental advice, diagnose, or suggest treatment.`,
    `- NEVER quote prices and NEVER confirm a specific appointment date or time. The front desk does that.`,
    `- If it sounds like a real emergency (severe bleeding that won't stop, facial swelling`,
    `  affecting breathing or swallowing, trauma, a knocked-out tooth, loss of consciousness),`,
    `  tell them to call 911 or go to the nearest emergency room now, and say you're alerting`,
    `  the clinic immediately. Set urgency_level to "emergency".`,
    `- Once you have name + reason + urgency + booking intent, set intake_complete to true and`,
    `  send a brief closing message ("Thanks {name} — someone from our team will text or call`,
    `  you back shortly to get you booked in.").`,
    `- Don't repeat questions you already have answers to.`,
  ].join("\n");
}

// JSON shape both providers must return.
const SCHEMA_FIELDS = {
  reply: "string — the text message to send back to the patient",
  caller_name: "string or null — the patient's name once known",
  reason: "string or null — short summary of why they're calling",
  urgency_level: `one of ${URGENCY_VALUES.join(", ")}`,
  booking_intent: `one of ${INTENT_VALUES.join(", ")}`,
  intake_complete: "boolean — true once name, reason, urgency and booking intent are known",
};

function coerce(raw: any, ctx: IntakeContext): IntakeResult {
  const urgency: UrgencyLevel = URGENCY_VALUES.includes(raw?.urgency_level)
    ? raw.urgency_level
    : ctx.current.urgency_level;
  const intent: BookingIntent = INTENT_VALUES.includes(raw?.booking_intent)
    ? raw.booking_intent
    : ctx.current.booking_intent;

  const lastPatient = [...ctx.history].reverse().find((t) => t.role === "patient");
  const emergency =
    urgency === "emergency" ||
    (lastPatient ? detectEmergencyText(lastPatient.body) : false);

  return {
    reply: String(raw?.reply || "").trim() ||
      "Thanks for your message — someone from our team will get back to you shortly.",
    fields: {
      caller_name: raw?.caller_name ?? ctx.current.caller_name,
      reason: raw?.reason ?? ctx.current.reason,
      urgency_level: emergency ? "emergency" : urgency,
      booking_intent: intent,
      intake_complete: Boolean(raw?.intake_complete),
    },
    emergency,
  };
}

// ---------------------------------------------------------------------
// OpenAI (default) — chat completions with strict structured output.
// ---------------------------------------------------------------------
async function runOpenAI(ctx: IntakeContext, key: string): Promise<IntakeResult> {
  const messages = [
    { role: "system", content: systemPrompt(ctx.clinicName) },
    ...ctx.history.map((t) => ({
      role: t.role === "patient" ? "user" : "assistant",
      content: t.body,
    })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: env.aiModel(),
      temperature: 0.3,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "intake",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              reply: { type: "string" },
              caller_name: { type: ["string", "null"] },
              reason: { type: ["string", "null"] },
              urgency_level: { type: "string", enum: URGENCY_VALUES },
              booking_intent: { type: "string", enum: INTENT_VALUES },
              intake_complete: { type: "boolean" },
            },
            required: [
              "reply",
              "caller_name",
              "reason",
              "urgency_level",
              "booking_intent",
              "intake_complete",
            ],
          },
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return coerce(JSON.parse(data.choices[0].message.content), ctx);
}

// ---------------------------------------------------------------------
// Anthropic (optional) — tool use forces a structured result.
// ---------------------------------------------------------------------
async function runAnthropic(ctx: IntakeContext, key: string): Promise<IntakeResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.aiModel(),
      max_tokens: 400,
      system: systemPrompt(ctx.clinicName),
      messages: ctx.history.map((t) => ({
        role: t.role === "patient" ? "user" : "assistant",
        content: t.body,
      })),
      tool_choice: { type: "tool", name: "capture_intake" },
      tools: [
        {
          name: "capture_intake",
          description: "Record the intake reply and the fields captured so far.",
          input_schema: {
            type: "object",
            properties: {
              reply: { type: "string" },
              caller_name: { type: ["string", "null"] },
              reason: { type: ["string", "null"] },
              urgency_level: { type: "string", enum: URGENCY_VALUES },
              booking_intent: { type: "string", enum: INTENT_VALUES },
              intake_complete: { type: "boolean" },
            },
            required: ["reply", "urgency_level", "booking_intent", "intake_complete"],
          },
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const tool = (data.content || []).find((c: any) => c.type === "tool_use");
  return coerce(tool?.input ?? {}, ctx);
}

// ---------------------------------------------------------------------
// Deterministic fallback — no LLM. Asks for the next missing field.
// Guarantees the product works even with zero AI configured / API down.
// ---------------------------------------------------------------------
function runFallback(ctx: IntakeContext): IntakeResult {
  const { current, history } = ctx;
  const lastPatient = [...history].reverse().find((t) => t.role === "patient");
  const lastText = lastPatient?.body?.trim() || "";
  const emergency = detectEmergencyText(lastText) || current.urgency_level === "emergency";

  const fields = { ...current };

  // Naive capture: first patient message after we asked their name = name.
  const askedName = history.some(
    (t) => t.role === "assistant" && /your name|who do we have/i.test(t.body),
  );
  const askedReason = history.some(
    (t) => t.role === "assistant" && /what can we help|reason|calling about/i.test(t.body),
  );

  let caller_name = fields.caller_name;
  let reason = fields.reason;
  if (!caller_name && askedName && lastText && history.length >= 2) caller_name = lastText.slice(0, 80);
  else if (!reason && askedReason && lastText) reason = lastText.slice(0, 280);

  if (emergency) {
    return {
      reply:
        "This sounds urgent. If it's a medical emergency please call 911 or go to the nearest " +
        "emergency room now. I'm alerting our team right away.",
      fields: { ...fields, caller_name, reason, urgency_level: "emergency", intake_complete: true },
      emergency: true,
    };
  }

  let reply: string;
  let intake_complete = false;
  if (!caller_name) {
    reply = `Thanks for getting back to us! Who do we have the pleasure of texting with?`;
  } else if (!reason) {
    reply = `Thanks, ${caller_name}! What can we help you with today?`;
  } else if (current.booking_intent === "unknown") {
    reply = `Got it. Would you like us to book you an appointment? (yes / no)`;
    if (/\b(yes|yeah|yep|book|appointment|sure)\b/i.test(lastText))
      fields.booking_intent = "new_patient";
    else if (/\b(no|not|just|question)\b/i.test(lastText)) fields.booking_intent = "question";
  } else {
    reply = `Perfect — thanks, ${caller_name}. Someone from our team will text or call you back shortly to help.`;
    intake_complete = true;
  }

  return {
    reply,
    fields: { ...fields, caller_name, reason, intake_complete },
    emergency: false,
  };
}

// ---------------------------------------------------------------------
// Public entry point.
// ---------------------------------------------------------------------
export async function runIntake(ctx: IntakeContext): Promise<IntakeResult> {
  const provider = env.aiProvider();
  try {
    if (provider === "openai") {
      const key = env.openaiKey();
      if (key) return await runOpenAI(ctx, key);
    } else if (provider === "anthropic") {
      const key = env.anthropicKey();
      if (key) return await runAnthropic(ctx, key);
    }
  } catch (err) {
    console.error("[intake] LLM call failed, using fallback:", err);
  }
  return runFallback(ctx);
}
