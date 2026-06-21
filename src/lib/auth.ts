// Auth + tenancy helpers shared by Server Components and Route Handlers.
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import type { Clinic, Conversation, Profile } from "@/lib/types";

// Re-exported so existing imports from "@/lib/auth" keep working.
export { isAdminEmail };

// For Server Components: who is logged in, their profile, and their clinic.
// Reads run as the user through RLS, so this only ever returns the caller's
// own clinic. `clinic` is null until onboarding is complete.
export async function getDashboardContext(): Promise<{
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  profile: Profile | null;
  clinic: Clinic | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, email: null, isAdmin: false, profile: null, clinic: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  let clinic: Clinic | null = null;
  if (profile?.clinic_id) {
    const { data } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", profile.clinic_id)
      .maybeSingle<Clinic>();
    clinic = data;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: isAdminEmail(user.email),
    profile: profile ?? null,
    clinic,
  };
}

// For Route Handlers: confirm `userId` belongs to the clinic that owns
// `conversationId`. Uses the admin client (caller must already be authed).
export async function requireClinicMember(
  admin: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<{ clinic: Clinic; conversation: Conversation } | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("clinic_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile?.clinic_id) return null;

  const { data: conversation } = await admin
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle<Conversation>();
  if (!conversation || conversation.clinic_id !== profile.clinic_id) return null;

  const { data: clinic } = await admin
    .from("clinics")
    .select("*")
    .eq("id", profile.clinic_id)
    .single<Clinic>();
  if (!clinic) return null;

  return { clinic, conversation };
}
