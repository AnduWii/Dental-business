import Link from "next/link";

// The app-wide empty-state pattern: one quiet message and one next step.
// No illustrations, no mascots, no emoji (docs/15).
export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mt-24 text-center">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="mx-auto mt-2 max-w-[36em] text-sm leading-relaxed text-slate-500">{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
