// String-union mirrors of the Postgres enums + row shapes used across the app.

export type UserRole = "owner" | "staff";
export type SubscriptionStatus = "pilot" | "active" | "paused" | "canceled";
export type CallStatus = "missed" | "completed" | "voicemail" | "failed";
export type ConversationStatus = "active" | "needs_attention" | "handled" | "closed";
export type ConversationMode = "ai" | "human";
export type MessageDirection = "inbound" | "outbound";
export type MessageSender = "patient" | "ai" | "staff" | "system";
export type UrgencyLevel = "unknown" | "low" | "medium" | "high" | "emergency";
export type BookingIntent =
  | "unknown"
  | "new_patient"
  | "existing_patient"
  | "reschedule"
  | "question"
  | "not_interested";
export type NotificationType = "new_lead" | "emergency" | "new_message" | "missed_call";
export type NotificationChannel = "sms" | "email" | "dashboard";
export type NotificationStatus = "pending" | "sent" | "failed";

export interface Clinic {
  id: string;
  name: string;
  timezone: string;
  twilio_number: string | null;
  twilio_messaging_service_sid: string | null;
  notify_phone: string | null;
  notify_email: string | null;
  textback_message: string;
  ai_enabled: boolean;
  ai_greeting: string | null;
  subscription_status: SubscriptionStatus;
  pilot_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  clinic_id: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  phone: string;
  name: string | null;
  opted_out: boolean;
  first_seen_at: string;
  last_contact_at: string;
}

export interface Conversation {
  id: string;
  clinic_id: string;
  patient_id: string;
  status: ConversationStatus;
  mode: ConversationMode;
  caller_name: string | null;
  reason: string | null;
  urgency_level: UrgencyLevel;
  booking_intent: BookingIntent;
  intake_complete: boolean;
  summary: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  clinic_id: string;
  conversation_id: string;
  direction: MessageDirection;
  sender: MessageSender;
  body: string;
  twilio_sid: string | null;
  status: string | null;
  created_at: string;
}

export interface CallEvent {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  conversation_id: string | null;
  twilio_call_sid: string | null;
  from_number: string | null;
  to_number: string | null;
  forwarded_from: string | null;
  status: CallStatus;
  textback_sent: boolean;
  occurred_at: string;
}

export interface Notification {
  id: string;
  clinic_id: string;
  conversation_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title: string | null;
  body: string | null;
  read_at: string | null;
  status: NotificationStatus;
  created_at: string;
}

// Conversation joined with its patient — the shape the inbox renders.
export type ConversationWithPatient = Conversation & { patient: Patient | null };
