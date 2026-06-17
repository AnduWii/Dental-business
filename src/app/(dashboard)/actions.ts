"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Create the clinic + owner profile during onboarding.
export async function createClinic(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  if (!name) return;

  const admin = createAdminClient();
  const { data: clinic, error } = await admin
    .from("clinics")
    .insert({
      name,
      timezone: String(formData.get("timezone") || "America/Toronto"),
      notify_phone: String(formData.get("notify_phone") || "") || null,
      notify_email: String(formData.get("notify_email") || user.email || "") || null,
    })
    .select("id")
    .single();
  if (error || !clinic) throw new Error(error?.message || "Could not create clinic");

  await admin.from("profiles").upsert({
    user_id: user.id,
    clinic_id: clinic.id,
    full_name: String(formData.get("full_name") || "") || null,
    role: "owner",
  });

  redirect("/dashboard");
}

// Update clinic settings.
export async function updateSettings(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("clinic_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.clinic_id) redirect("/onboarding");

  await admin
    .from("clinics")
    .update({
      name: String(formData.get("name") || "").trim(),
      twilio_number: String(formData.get("twilio_number") || "") || null,
      twilio_messaging_service_sid: String(formData.get("twilio_messaging_service_sid") || "") || null,
      notify_phone: String(formData.get("notify_phone") || "") || null,
      notify_email: String(formData.get("notify_email") || "") || null,
      textback_message: String(formData.get("textback_message") || "").trim(),
      ai_enabled: formData.get("ai_enabled") === "on",
      timezone: String(formData.get("timezone") || "America/Toronto"),
    })
    .eq("id", profile.clinic_id);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
