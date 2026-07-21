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

// Admin deletes a clinic (used to clean up test/duplicate clinics). The schema
// cascades: patients, conversations, messages, call events, and notifications
// go with it; owner profiles get clinic_id set to null (they can onboard
// again); audit rows are untouched and keep the clinic id as history
// (migration 0004 removed their FK, the append-only trigger forbids updates).
// Never throws: returns { ok, error } so the UI can show what went wrong
// instead of crashing to the generic application-error page.
export async function deleteClinicAsAdmin(
  clinicId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) return { ok: false, error: "Not authorized." };
    if (!clinicId) return { ok: false, error: "Missing clinic id." };

    const admin = createAdminClient();
    const { data: clinic } = await admin
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .maybeSingle();
    if (!clinic) return { ok: true };

    // Log first: the audit row's clinic_id is set null by the delete, but the
    // action and target name survive.
    await logAudit({
      clinicId,
      actorEmail: user.email,
      action: "admin.clinic_delete",
      target: clinic.name,
    });

    const { error } = await admin.from("clinics").delete().eq("id", clinicId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[admin] clinic delete failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Delete failed." };
  }
}
