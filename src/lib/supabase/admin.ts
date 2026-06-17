// Service-role Supabase client. Bypasses Row Level Security — SERVER ONLY.
// Used by Twilio webhooks and server actions AFTER an explicit membership
// check. Never import this into a client component.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
