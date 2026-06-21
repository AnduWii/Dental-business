// Server Supabase client bound to the request's cookies (anon key + user JWT).
// Use in Server Components, Server Actions and Route Handlers for reads as the
// signed-in user, and to discover who is logged in.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        // Setting cookies from a Server Component throws; the middleware
        // refreshes the session, so it's safe to swallow here.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* called from a Server Component, ignore */
        }
      },
    },
  });
}
