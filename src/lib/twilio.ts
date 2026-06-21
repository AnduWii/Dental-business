// Twilio helpers, SMS sending, webhook signature validation, and TwiML.
// Server only.
import twilio from "twilio";
import { env } from "@/lib/env";
import { withRetry } from "@/lib/retry";

export function getTwilioClient() {
  return twilio(env.twilioAccountSid(), env.twilioAuthToken());
}

interface SendSmsArgs {
  to: string;
  from?: string; // a clinic's Twilio number; omit when using a Messaging Service
  body: string;
  messagingServiceSid?: string;
}

export async function sendSms({ to, from, body, messagingServiceSid }: SendSmsArgs) {
  const client = getTwilioClient();
  const serviceSid = messagingServiceSid || env.twilioMessagingServiceSid();

  const payload: { to: string; body: string; from?: string; messagingServiceSid?: string } = {
    to,
    body,
  };
  if (serviceSid) payload.messagingServiceSid = serviceSid;
  else if (from) payload.from = from;
  else throw new Error("sendSms requires either a `from` number or a Messaging Service SID");

  // Retry transient Twilio/network blips with backoff.
  return withRetry(() => client.messages.create(payload), { retries: 2, baseMs: 300 });
}

// Validate that an incoming webhook genuinely came from Twilio.
// `params` are the parsed form fields; `url` is the exact public URL Twilio hit.
export function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>,
): boolean {
  if (!signature) return false;
  try {
    return twilio.validateRequest(env.twilioAuthToken(), signature, url, params);
  } catch {
    return false;
  }
}

// TwiML spoken to a forwarded (missed) caller before we hang up and text them.
export function missedCallTwiml(clinicName: string): string {
  const safe = clinicName.replace(/[<>&]/g, "");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    "<Response>" +
    `<Say voice="Polly.Joanna">Thanks for calling ${safe}. ` +
    "Sorry we couldn't take your call. We're sending you a text message right now " +
    "so we can help you from there.</Say>" +
    "<Hangup/>" +
    "</Response>"
  );
}

// Empty TwiML, used when we reply to an SMS asynchronously via the REST API
// instead of inline, so Twilio doesn't also send a response.
export const EMPTY_TWIML =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
