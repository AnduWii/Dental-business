import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/auth";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

export const dynamic = "force-dynamic";

const ICON: Record<Notification["type"], string> = {
  emergency: "🚨",
  new_lead: "✅",
  new_message: "💬",
  missed_call: "📞",
};

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
        <h1 className="text-xl font-semibold">Notifications</h1>
      </header>

      <div className="scroll-area flex-1 overflow-y-auto px-8 py-6">
        {list.length === 0 ? (
          <p className="mt-20 text-center text-slate-500">Nothing yet.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => {
              const inner = (
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="text-xl">{ICON[n.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{n.title}</p>
                    <p className="truncate text-sm text-slate-600">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.conversation_id ? (
                    <Link href={`/conversations/${n.conversation_id}`} className="block hover:opacity-90">
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
