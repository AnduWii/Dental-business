"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { sanitizeText, normalizePhone, isValidEmail, LIMITS } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

// Create the clinic + owner profile during onboarding.
export async function createClinic(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = sanitizeText(formData.get("name"), LIMITS.clinicName);
  if (!name) return;

  const notifyEmailRaw = String(formData.get("notify_email") || user.email || "");

  const admin = createAdminClient();
  const { data: clinic, error } = await admin
    .from("clinics")
    .insert({
      name,
      timezone: sanitizeText(formData.get("timezone"), 64) || "America/Toronto",
      notify_phone: normalizePhone(formData.get("notify_phone")),
      notify_email: isValidEmail(notifyEmailRaw) ? notifyEmailRaw : null,
    })
    .select("id")
    .single();
  if (error || !clinic) throw new Error(error?.message || "Could not create clinic");

  await admin.from("profiles").upsert({
    user_id: user.id,
    clinic_id: clinic.id,
    full_name: sanitizeText(formData.get("full_name"), LIMITS.name) || null,
    role: "owner",
  });

  await logAudit({
    clinicId: clinic.id,
    actorEmail: user.email,
    action: "clinic.create",
    target: clinic.id,
  });

  redirect("/dashboard");
}

// Update clinic settings.
export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
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

  const notifyEmailRaw = String(formData.get("notify_email") || "");

  await admin
    .from("clinics")
    .update({
      name: sanitizeText(formData.get("name"), LIMITS.clinicName),
      twilio_number: normalizePhone(formData.get("twilio_number")),
      twilio_messaging_service_sid: sanitizeText(formData.get("twilio_messaging_service_sid"), 64) || null,
      notify_phone: normalizePhone(formData.get("notify_phone")),
      notify_email: isValidEmail(notifyEmailRaw) ? notifyEmailRaw : null,
      textback_message: sanitizeText(formData.get("textback_message"), 600),
      ai_enabled: formData.get("ai_enabled") === "on",
      timezone: sanitizeText(formData.get("timezone"), 64) || "America/Toronto",
    })
    .eq("id", profile.clinic_id);

  await logAudit({
    clinicId: profile.clinic_id,
    actorEmail: user.email,
    action: "clinic.settings_update",
    target: profile.clinic_id,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

// Admin edits ANY clinic's settings (hybrid model: you do "free setup" for a
// clinic that owns its own dashboard). Gated to platform admins.
export async function updateClinicAsAdmin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/login");

  const clinicId = String(formData.get("clinic_id") || "");
  if (!clinicId) return;

  const admin = createAdminClient();
  const notifyEmailRaw = String(formData.get("notify_email") || "");

  await admin
    .from("clinics")
    .update({
      name: sanitizeText(formData.get("name"), LIMITS.clinicName),
      twilio_number: normalizePhone(formData.get("twilio_number")),
      twilio_messaging_service_sid: sanitizeText(formData.get("twilio_messaging_service_sid"), 64) || null,
      notify_phone: normalizePhone(formData.get("notify_phone")),
      notify_email: isValidEmail(notifyEmailRaw) ? notifyEmailRaw : null,
      textback_message: sanitizeText(formData.get("textback_message"), 600),
      ai_enabled: formData.get("ai_enabled") === "on",
      timezone: sanitizeText(formData.get("timezone"), 64) || "America/Toronto",
    })
    .eq("id", clinicId);

  await logAudit({
    clinicId,
    actorEmail: user.email,
    action: "admin.clinic_settings_update",
    target: clinicId,
  });

  revalidatePath(`/admin/clinics/${clinicId}`);
}
