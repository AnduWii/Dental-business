// Paging the clinic. The "pager" half of the product: when a lead is captured
// (or an emergency is detected), the front desk gets an SMS, an optional email,
// and a row in the dashboard notifications feed. Server only.
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio";
import { env } from "@/lib/env";
import type { Clinic, NotificationType } from "@/lib/types";

interface NotifyArgs {
  clinic: Clinic;
  conversationId: string;
  type: NotificationType;
  title: string;
  body: string;
}

export async function notifyClinic({ clinic, conversationId, type, title, body }: NotifyArgs) {
  const admin = createAdminClient();

  // 1) Always record an in-dashboard notification.
  await admin.from("notifications").insert({
    clinic_id: clinic.id,
    conversation_id: conversationId,
    type,
    channel: "dashboard",
    title,
    body,
    status: "sent",
  });

  // 2) SMS page to the front desk (the core "pager" alert).
  if (clinic.notify_phone && clinic.twilio_number) {
    const smsBody = `${title}\n${body}\n\nOpen: ${env.appUrl()}/conversations/${conversationId}`;
    try {
      await sendSms({
        to: clinic.notify_phone,
        from: clinic.twilio_number,
        messagingServiceSid: clinic.twilio_messaging_service_sid || undefined,
        body: smsBody,
      });
      await admin.from("notifications").insert({
        clinic_id: clinic.id,
        conversation_id: conversationId,
        type,
        channel: "sms",
        title,
        body,
        status: "sent",
      });
    } catch (err) {
      console.error("[notify] SMS page failed:", err);
      await admin.from("notifications").insert({
        clinic_id: clinic.id,
        conversation_id: conversationId,
        type,
        channel: "sms",
        title,
        body,
        status: "failed",
      });
    }
  }

  // 3) Optional email page (only if Resend is configured).
  const resendKey = env.resendKey();
  if (resendKey && clinic.notify_email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: env.notifyFromEmail(),
          to: clinic.notify_email,
          subject: title,
          text: `${body}\n\nOpen the conversation: ${env.appUrl()}/conversations/${conversationId}`,
        }),
      });
      await admin.from("notifications").insert({
        clinic_id: clinic.id,
        conversation_id: conversationId,
        type,
        channel: "email",
        title,
        body,
        status: "sent",
      });
    } catch (err) {
      console.error("[notify] email page failed:", err);
    }
  }
}
