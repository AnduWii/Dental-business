// Branding lives in one place so the SaaS name is a one-line change.
export const BRAND = {
  name: "Recall",
  tagline: "Every missed call, recovered.",
  supportEmail: "founders@tryrecall.com",
} as const;

// Default copy used when a clinic hasn't customised its own.
export const DEFAULT_TEXTBACK =
  "Hi, this is {{clinic}}. Sorry we missed your call — we're with a patient. " +
  "Reply here and we'll get you sorted. How can we help?";

// Max length we allow a single outbound SMS segment-friendly reply to be.
export const MAX_SMS_LENGTH = 480;
