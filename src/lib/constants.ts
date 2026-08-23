// Branding lives in one place so the SaaS name is a one-line change.
export const BRAND = {
  name: "Catchline",
  tagline: "Every missed call, recovered.",
  supportEmail: "team.catchlineservices@gmail.com",
  // Legal operating entity (used in the clinic DPA signature block).
  legalEntity: "Catchline Services Inc.",
} as const;

// Default copy used when a business hasn't customised its own. The dental
// default also lives as the column default in the database (0001); the
// real estate default is applied at onboarding for that vertical.
export const DEFAULT_TEXTBACK =
  "Hi, this is {{clinic}}. Sorry we missed your call, we're with a patient. " +
  "Reply here and we'll get you sorted. How can we help?";

export const DEFAULT_TEXTBACK_REAL_ESTATE =
  "Hi, this is {{clinic}}. Sorry we missed your call, we're with a client. " +
  "Reply here and we'll get you sorted. How can we help?";

// Vertical display names, used in forms and copy.
export const VERTICAL_LABELS = {
  dental: "Dental clinic",
  real_estate: "Real estate office",
} as const;

// Max length we allow a single outbound SMS segment-friendly reply to be.
export const MAX_SMS_LENGTH = 480;

// Platform admins (founder accounts). When one of these emails signs in it
// gets access to the cross-clinic /admin overview. Extendable via the
// ADMIN_EMAILS env var (comma-separated).
export const DEFAULT_ADMIN_EMAILS = ["andrewbirdie777@gmail.com"];
