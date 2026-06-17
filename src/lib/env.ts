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

export const env = {
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Supabase
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),

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
  notifyFromEmail: () => process.env.NOTIFY_FROM_EMAIL || "alerts@tryrecall.com",
};
