import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConversationView } from "@/components/ConversationView";
import { UrgencyBadge, StatusBadge, IntentBadge } from "@/components/ui/badges";
import { formatPhone } from "@/lib/format";
import type { Conversation, Message, Patient } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, patient:patients(*)")
    .eq("id", id)
    .maybeSingle<Conversation & { patient: Patient | null }>();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  const patient = conversation.patient;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-hidden">
        <ConversationView
          conversationId={conversation.id}
          patientName={conversation.caller_name || patient?.name || ""}
          patientPhone={patient?.phone || ""}
          optedOut={patient?.opted_out ?? false}
          initialMode={conversation.mode}
          initialMessages={messages ?? []}
        />
      </div>

      {/* Captured-lead panel */}
      <aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white px-6 py-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Captured lead
        </h3>
        <dl className="mt-4 space-y-4 text-sm">
          <Row label="Name" value={conversation.caller_name || patient?.name || "—"} />
          <Row label="Phone" value={formatPhone(patient?.phone)} />
          <div>
            <dt className="text-slate-500">Reason</dt>
            <dd className="mt-1 text-slate-900">{conversation.reason || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Urgency</dt>
            <dd className="mt-1">
              <UrgencyBadge level={conversation.urgency_level} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Booking intent</dt>
            <dd className="mt-1">
              {conversation.booking_intent === "unknown" ? (
                "—"
              ) : (
                <IntentBadge intent={conversation.booking_intent} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={conversation.status} />
            </dd>
          </div>
          <Row
            label="Intake"
            value={conversation.intake_complete ? "Complete" : "In progress"}
          />
        </dl>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{value}</dd>
    </div>
  );
}
