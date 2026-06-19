import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";
import { updateClinicAsAdmin } from "@/app/(dashboard)/actions";
import { ClinicSettingsForm } from "@/components/ClinicSettingsForm";
import { env } from "@/lib/env";
import { formatPhone, timeAgo } from "@/lib/format";
import type { Clinic, ConversationWithPatient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminClinicPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  // Admin reads any clinic via the service role (not a member → bypass RLS).
  const admin = createAdminClient();
  const { data: clinic } = await admin
    .from("clinics")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Clinic>();
  if (!clinic) notFound();

  const { data: convos } = await admin
    .from("conversations")
    .select("*, patient:patients(*)")
    .eq("clinic_id", clinic.id)
    .order("last_message_at", { ascending: false })
    .limit(10)
    .returns<ConversationWithPatient[]>();

  const recent = convos ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Admin
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">{clinic.name}</h1>
          </div>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
            Admin
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent conversations
          </h2>
          {recent.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No conversations yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recent.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-slate-900">
                      {c.caller_name || c.patient?.name || formatPhone(c.patient?.phone)}
                    </span>
                    <span className="shrink-0 text-slate-400">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <p className="truncate text-slate-600">{c.reason || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Configure this clinic (free setup)
          </h2>
          <ClinicSettingsForm clinic={clinic} action={updateClinicAsAdmin} appUrl={env.appUrl()} />
        </section>
      </div>
    </main>
  );
}
