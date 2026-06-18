// Input validation & sanitization. Used at every trust boundary: Twilio
// webhooks, staff API routes, and onboarding/settings forms. Supabase queries
// are parameterized (no SQL injection) and React escapes JSX (no stored XSS),
// so this layer focuses on shape, length and normalization.

export const LIMITS = {
  smsBody: 1200, // inbound text we'll store / feed the AI
  reply: 480, // outbound staff/AI message
  name: 120,
  reason: 500,
  clinicName: 120,
  email: 254,
} as const;

// C0/C1 control characters, but keep tab, newline and carriage return.
// Built from an escaped string so no control bytes live in the source file.
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]",
  "g",
);

// Strip control characters and collapse to a max length.
export function sanitizeText(input: unknown, max: number): string {
  if (typeof input !== "string") return "";
  return input.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

// Normalize a North-American phone number to E.164 (+1XXXXXXXXXX). Returns
// null if it can't be made valid. Twilio already sends E.164, but we never
// trust input shape.
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (/^\+[1-9]\d{7,14}$/.test(trimmed)) return trimmed; // already E.164
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function isValidE164(input: unknown): input is string {
  return typeof input === "string" && /^\+[1-9]\d{7,14}$/.test(input);
}

export function isValidEmail(input: unknown): input is string {
  return (
    typeof input === "string" &&
    input.length <= LIMITS.email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
  );
}

// Guard an enum-ish value against an allow-list.
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}
