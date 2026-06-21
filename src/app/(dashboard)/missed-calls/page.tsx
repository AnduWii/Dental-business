import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/auth";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { formatPhone, formatDateTime } from "@/lib/format";
import type { CallEvent, Patient } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = CallEvent & { patient: Patient | null };

export default async function MissedCallsPage() {
  const { clinic } = await getDashboardContext();
  const supabase = await createClient();

  const { data: calls } = await supabase
    .from("call_events")
    .select("*, patient:patients(*)")
    .order("occurred_at", { ascending: false })
    .limit(200)
    .returns<Row[]>();

  const list = calls ?? [];
  const today = list.filter(
    (c) => new Date(c.occurred_at).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div className="flex h-full flex-col">
      <RealtimeRefresher table="conversations" clinicId={clinic!.id} />
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold">Missed calls</h1>
        <p className="mt-2 text-sm text-slate-600">
          <strong>{today}</strong> today · <strong>{list.length}</strong> recorded.
        </p>
      </header>

      <div className="scroll-area flex-1 overflow-y-auto px-8 py-6">
        {list.length === 0 ? (
          <p className="mt-20 text-center text-slate-500">No missed calls recorded yet.</p>
        ) : (
          <table className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Caller</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Text-back</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">
                    {c.patient?.name || formatPhone(c.from_number)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(c.occurred_at)}</td>
                  <td className="px-4 py-3">
                    {c.textback_sent ? (
                      <span className="text-green-700">Sent</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.conversation_id && (
                      <Link
                        href={`/conversations/${c.conversation_id}`}
                        className="text-brand-600 hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
