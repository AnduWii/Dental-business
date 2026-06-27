import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/auth";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { clinic } = await getDashboardContext();
  const supabase = await createClient();

  // Dashboard-channel rows are the user-facing feed (sms/email rows are send logs).
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("channel", "dashboard")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<Notification[]>();

  const list = notifications ?? [];

  return (
    <div className="flex h-full flex-col">
      <RealtimeRefresher table="notifications" clinicId={clinic!.id} />
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold text-brand-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">Leads, emergencies, and replies as they land.</p>
      </header>

      <div className="scroll-area flex-1 overflow-y-auto bg-slate-50 px-8 py-6">
        {list.length === 0 ? (
          <p className="mt-20 text-center text-slate-500">Nothing yet.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => {
              const inner = (
                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors duration-150 group-hover:border-brand-400">
                  <NotifIcon type={n.type} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-900">{n.title}</p>
                    <p className="truncate text-sm text-slate-600">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.conversation_id ? (
                    <Link href={`/conversations/${n.conversation_id}`} className="group block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const ICON_PATH: Record<Notification["type"], React.ReactNode> = {
  emergency: (
    <>
      <path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  new_lead: <path d="M20 6 9 17l-5-5" />,
  new_message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  missed_call: (
    <path d="M14.5 4.5 19 9M19 4.5 14.5 9M3 5.5a2 2 0 0 1 2-2h2.3a1 1 0 0 1 1 .76l.9 3.6a1 1 0 0 1-.5 1.1L8 10a14 14 0 0 0 6 6l1-1.1a1 1 0 0 1 1.1-.3l3.6.9a1 1 0 0 1 .76 1V20a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5z" />
  ),
};

function NotifIcon({ type }: { type: Notification["type"] }) {
  const tone =
    type === "emergency"
      ? "bg-red-50 text-red-700"
      : type === "new_lead"
        ? "bg-emerald-50 text-emerald-700"
        : type === "missed_call"
          ? "bg-slate-100 text-slate-600"
          : "bg-brand-50 text-brand-700";
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        {ICON_PATH[type]}
      </svg>
    </span>
  );
}
