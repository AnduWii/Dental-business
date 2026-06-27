import type { ReactNode } from "react";

// A compact dashboard metric card. Uses the brand palette; "tone" tints the
// number to flag urgency (alert) or activity (active).
export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "alert" | "active";
}) {
  const valueColor =
    tone === "alert" ? "text-red-600" : tone === "active" ? "text-brand-600" : "text-brand-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-3xl font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
