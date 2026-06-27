// Lazy env access. We read variables inside functions (not at module load)
// so `next build` never crashes when a key is absent, and we fail loudly at
// runtime only when a feature that needs the key is actually used.

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

// For NEXT_PUBLIC_* values used in the browser: Next.js only inlines a
// *literal* `process.env.NEXT_PUBLIC_FOO` reference into the client bundle,
// never a dynamic `process.env[name]` lookup. So these getters must pass the
// already-resolved literal value, not a variable name.
function need(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Supabase (anon URL/key are public and used in the browser → static refs).
  supabaseUrl: () => need(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () =>
    need(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"), // server-only
  // True once Supabase keys exist. Lets the public site boot before setup.
  isSupabaseConfigured: () =>
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),

  // Twilio
  twilioAccountSid: () => required("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: () => required("TWILIO_AUTH_TOKEN"),
  twilioMessagingServiceSid: () => optional("TWILIO_MESSAGING_SERVICE_SID"),

  // AI
  aiProvider: () => (process.env.AI_PROVIDER || "openai").toLowerCase(),
  aiModel: () => process.env.AI_MODEL || "gpt-4o-mini",
  openaiKey: () => optional("OPENAI_API_KEY"),
  anthropicKey: () => optional("ANTHROPIC_API_KEY"),

  // Email (optional)
  resendKey: () => optional("RESEND_API_KEY"),
  notifyFromEmail: () => process.env.NOTIFY_FROM_EMAIL || "alerts@trycatchline.com",

  // Stripe (billing). All optional; billing routes return 503 until these are set.
  stripeSecretKey: () => optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => optional("STRIPE_WEBHOOK_SECRET"),
  stripePriceId: () => optional("STRIPE_PRICE_ID"),

  // Extra platform-admin emails (comma-separated), merged with the defaults.
  adminEmails: () =>
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
};
