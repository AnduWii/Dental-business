import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { BRAND } from "@/lib/constants";
import type { Clinic } from "@/lib/types";

export const dynamic = "force-dynamic";

async function countFor(
  admin: ReturnType<typeof createAdminClient>,
  table: "conversations" | "call_events",
  clinicId: string,
  extra?: (q: any) => any,
) {
  let q = admin.from(table).select("*", { count: "exact", head: true }).eq("clinic_id", clinicId);
  if (extra) q = extra(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminPage() {
  // Gate: must be signed in AND a platform admin.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  // Cross-tenant read via the service role (RLS bypassed — admins only).
  const admin = createAdminClient();
  const { data: clinics } = await admin
    .from("clinics")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Clinic[]>();

  const rows = await Promise.all(
    (clinics ?? []).map(async (c) => ({
      clinic: c,
      conversations: await countFor(admin, "conversations", c.id),
      leads: await countFor(admin, "conversations", c.id, (q) => q.eq("intake_complete", true)),
      missed: await countFor(admin, "call_events", c.id),
    })),
  );

  const totals = rows.reduce(
    (a, r) => ({
      clinics: a.clinics + 1,
      conversations: a.conversations + r.conversations,
      leads: a.leads + r.leads,
      missed: a.missed + r.missed,
    }),
    { clinics: 0, conversations: 0, leads: 0, missed: 0 },
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <span className="text-lg font-semibold text-brand-700">{BRAND.name}</span>
            <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              My dashboard
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-slate-500 hover:text-slate-700">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-xl font-semibold text-slate-900">Platform overview</h1>
        <p className="mt-1 text-sm text-slate-500">Signed in as {user.email}</p>

        {/* Totals */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Clinics" value={totals.clinics} />
          <Stat label="Conversations" value={totals.conversations} />
          <Stat label="Leads captured" value={totals.leads} />
          <Stat label="Missed calls" value={totals.missed} />
        </div>

        {/* Clinics table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Clinic</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Conversations</th>
                <th className="px-4 py-3 font-medium">Leads</th>
                <th className="px-4 py-3 font-medium">Missed</th>
                <th className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No clinics yet.{" "}
                    <Link href="/onboarding" className="text-brand-600 underline">
                      Create one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.clinic.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.clinic.name}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">
                      {r.clinic.subscription_status}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.conversations}</td>
                    <td className="px-4 py-3 text-slate-600">{r.leads}</td>
                    <td className="px-4 py-3 text-slate-600">{r.missed}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(r.clinic.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
