import { DEFAULT_ADMIN_EMAILS } from "@/lib/constants";
import { env } from "@/lib/env";

// Is this email a platform admin (founder)? Defaults + ADMIN_EMAILS env.
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allow = new Set([
    ...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...env.adminEmails(),
  ]);
  return allow.has(email.toLowerCase());
}
