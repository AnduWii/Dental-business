// Presentational status pills. No hooks → usable in server or client components.
import type {
  BookingIntent,
  ConversationMode,
  ConversationStatus,
  UrgencyLevel,
} from "@/lib/types";

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const map: Record<UrgencyLevel, [string, string]> = {
    unknown: ["Unknown", "bg-slate-100 text-slate-600"],
    low: ["Low", "bg-slate-100 text-slate-700"],
    medium: ["Medium", "bg-amber-100 text-amber-800"],
    high: ["High", "bg-orange-100 text-orange-800"],
    emergency: ["Emergency", "bg-red-100 text-red-800"],
  };
  const [label, cls] = map[level];
  return <Pill label={label} className={cls} />;
}

export function StatusBadge({ status }: { status: ConversationStatus }) {
  const map: Record<ConversationStatus, [string, string]> = {
    active: ["Active", "bg-blue-100 text-blue-800"],
    needs_attention: ["Needs attention", "bg-red-100 text-red-800"],
    handled: ["Handled", "bg-green-100 text-green-800"],
    closed: ["Closed", "bg-slate-100 text-slate-600"],
  };
  const [label, cls] = map[status];
  return <Pill label={label} className={cls} />;
}

export function ModeBadge({ mode }: { mode: ConversationMode }) {
  return mode === "ai" ? (
    <Pill label="Autopilot" className="bg-brand-50 text-brand-700" />
  ) : (
    <Pill label="You're replying" className="bg-purple-100 text-purple-800" />
  );
}

export function IntentBadge({ intent }: { intent: BookingIntent }) {
  if (intent === "unknown") return null;
  const label = intent.replace("_", " ");
  return <Pill label={label} className="bg-teal-100 text-teal-800" />;
}
