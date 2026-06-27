import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/auth";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { UrgencyBadge, StatusBadge, ModeBadge, IntentBadge } from "@/components/ui/badges";
import { StatCard } from "@/components/ui/StatCard";
import { formatPhone, timeAgo } from "@/lib/format";
import type { ConversationWithPatient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { clinic } = await getDashboardContext();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, patient:patients(*)")
    .order("last_message_at", { ascending: false })
    .limit(100)
    .returns<ConversationWithPatient[]>();

  const list = conversations ?? [];
  const needsAttention = list.filter((c) => c.status === "needs_attention").length;
  const active = list.filter((c) => c.status === "active").length;
  const leadsCaptured = list.filter((c) => c.intake_complete).length;

  return (
    <div className="flex h-full flex-col">
      <RealtimeRefresher table="conversations" clinicId={clinic!.id} />

      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold text-brand-900">Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">Every patient conversation, newest first.</p>
      </header>

      <div className="scroll-area flex-1 overflow-y-auto bg-slate-50 px-8 py-6">
        <div className="mb-6 flex flex-col divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
          <StatCard label="Need attention" value={needsAttention} tone="alert" />
          <StatCard label="Active" value={active} tone="active" />
          <StatCard label="Leads captured" value={leadsCaptured} />
          <StatCard label="Total" value={list.length} />
        </div>
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/conversations/${c.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors duration-150 hover:border-brand-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {c.caller_name || c.patient?.name || formatPhone(c.patient?.phone)}
                        </span>
                        {c.urgency_level !== "unknown" && <UrgencyBadge level={c.urgency_level} />}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {c.reason || "No reason captured yet"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={c.status} />
                        <ModeBadge mode={c.mode} />
                        <IntentBadge intent={c.booking_intent} />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {timeAgo(c.last_message_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 text-center">
      <p className="text-lg font-medium text-slate-700">No conversations yet</p>
      <p className="mt-2 text-sm text-slate-500">
        When a call is missed and forwarded to your Catchline number, the text-back conversation will
        show up here. Set up call forwarding in{" "}
        <Link href="/settings" className="text-brand-600 underline">
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
