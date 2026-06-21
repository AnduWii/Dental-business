// Branding lives in one place so the SaaS name is a one-line change.
export const BRAND = {
  name: "Catchline",
  tagline: "Every missed call, recovered.",
  supportEmail: "founders@trycatchline.com",
  // Legal operating entity (used in the clinic DPA signature block). Sole
  // proprietor for now; update if/when the business incorporates.
  legalEntity: "Andrew Li (operating as Catchline)",
} as const;

// Default copy used when a clinic hasn't customised its own.
export const DEFAULT_TEXTBACK =
  "Hi, this is {{clinic}}. Sorry we missed your call — we're with a patient. " +
  "Reply here and we'll get you sorted. How can we help?";

// Max length we allow a single outbound SMS segment-friendly reply to be.
export const MAX_SMS_LENGTH = 480;

// Platform admins (founder accounts). When one of these emails signs in it
// gets access to the cross-clinic /admin overview. Extendable via the
// ADMIN_EMAILS env var (comma-separated).
export const DEFAULT_ADMIN_EMAILS = ["andrewbirdie777@gmail.com"];
