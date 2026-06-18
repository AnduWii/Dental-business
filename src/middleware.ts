// Refreshes the Supabase auth session on every navigation and gates the
// dashboard. Twilio webhooks live under /api and are excluded by the matcher,
// so they're never redirected or auth-checked.
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PROTECTED = [
  "/dashboard",
  "/conversations",
  "/settings",
  "/notifications",
  "/missed-calls",
  "/onboarding",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  // Before Supabase is configured, let public pages render and keep the
  // dashboard behind a redirect to /login (which explains setup is needed).
  if (!env.isSupabaseConfigured()) {
    if (isProtected) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Run on everything except API routes, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
