// Browser Supabase client (anon key + the logged-in user's session).
// Used by client components for live reads via Row Level Security.
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(env.supabaseUrl(), env.supabaseAnonKey());
}
