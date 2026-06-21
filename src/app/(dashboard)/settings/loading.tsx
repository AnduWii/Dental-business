import { Skeleton } from "@/components/ui/Skeleton";

// Loading state for Settings: header plus the clinic settings form sections,
// matching settings/page.tsx.
export default function SettingsLoading() {
  return (
    <div className="h-full overflow-y-auto" role="status">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <Skeleton className="h-6 w-32" />
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-8 py-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
}
