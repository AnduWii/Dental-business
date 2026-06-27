import type { ReactNode } from "react";

// One cell of the dashboard stat strip. Borderless by design: the parent strip
// supplies the surrounding border and the dividers between cells (see the
// inbox). "tone" tints the number to flag urgency (alert) or activity (active).
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
    <div className="flex-1 px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-3xl font-semibold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
