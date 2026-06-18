// Abuse & cost control. Twilio signature validation already blocks spoofed
// webhooks; this caps how much money/SMS a single conversation can burn if a
// caller (or a loop) keeps texting. DB-backed so it holds across serverless
// instances. When the cap trips we stop the AI, flag the thread for a human,
// and let staff continue manually.
import type { SupabaseClient } from "@supabase/supabase-js";

export const AUTO_REPLY_WINDOW_MIN = 60;
export const MAX_AUTO_REPLIES_PER_WINDOW = 20;

// How many AI/system messages we've sent on this conversation in the window.
export async function autoRepliesInWindow(
  admin: SupabaseClient,
  conversationId: string,
  windowMin = AUTO_REPLY_WINDOW_MIN,
): Promise<number> {
  const since = new Date(Date.now() - windowMin * 60_000).toISOString();
  const { count } = await admin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("direction", "outbound")
    .in("sender", ["ai", "system"])
    .gte("created_at", since);
  return count ?? 0;
}

export async function autoReplyLimitReached(
  admin: SupabaseClient,
  conversationId: string,
): Promise<boolean> {
  return (await autoRepliesInWindow(admin, conversationId)) >= MAX_AUTO_REPLIES_PER_WINDOW;
}
