import { Skeleton } from "@/components/ui/Skeleton";

// Default loading state for the dashboard list pages (Inbox, Missed calls,
// Notifications). Rendered inside the dashboard shell, so the sidebar stays put
// while the content streams in.
export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col" role="status">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-4 w-72" />
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <ul className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-3/4" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
