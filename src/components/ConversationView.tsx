"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPhone, formatDateTime } from "@/lib/format";
import type { Message, ConversationMode } from "@/lib/types";

interface Props {
  conversationId: string;
  patientName: string;
  patientPhone: string;
  optedOut: boolean;
  initialMode: ConversationMode;
  initialMessages: Message[];
}

export function ConversationView({
  conversationId,
  patientName,
  patientPhone,
  optedOut,
  initialMode,
  initialMessages,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [mode, setMode] = useState<ConversationMode>(initialMode);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live-append new messages.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`convo:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function setTakeover(next: ConversationMode) {
    setMode(next);
    await fetch(`/api/conversations/${conversationId}/takeover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: next, status: next === "human" ? "handled" : "active" }),
    });
    router.refresh();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setDraft("");
      setMode("human");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to send");
    }
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h2 className="font-semibold">{patientName || formatPhone(patientPhone)}</h2>
          <p className="text-sm text-slate-500">{formatPhone(patientPhone)}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={mode === "ai" ? "text-brand-700" : "text-slate-900"}>
            {mode === "ai" ? "Autopilot is replying" : "You're replying"}
          </span>
          {mode === "ai" ? (
            <button
              onClick={() => setTakeover("human")}
              className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white transition-colors duration-150 hover:bg-slate-700"
            >
              Take over
            </button>
          ) : (
            <button
              onClick={() => setTakeover("ai")}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50"
            >
              Hand back to autopilot
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="scroll-area flex-1 space-y-3 overflow-y-auto bg-slate-50 px-6 py-5">
        {messages.map((m) => {
          const inbound = m.direction === "inbound";
          return (
            <div key={m.id} className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  inbound
                    ? "rounded-bl-sm bg-white text-slate-900 shadow-sm"
                    : m.sender === "staff"
                      ? "rounded-br-sm bg-slate-900 text-white"
                      : "rounded-br-sm bg-brand-600 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] ${inbound ? "text-slate-400" : "text-white/70"}`}>
                  {m.sender === "ai" ? "Autopilot · " : m.sender === "staff" ? "You · " : ""}
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={send} className="border-t border-slate-200 bg-white px-6 py-4">
        {optedOut ? (
          <p className="text-sm text-red-600">
            This patient texted STOP and has opted out. You can&apos;t message them here.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-3">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a reply… (sending switches this thread to you)"
                className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </>
        )}
      </form>
    </div>
  );
}
