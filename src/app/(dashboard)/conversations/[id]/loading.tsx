import { Skeleton } from "@/components/ui/Skeleton";

// Loading state for a single conversation: the message thread (left) and the
// captured-lead panel (right), matching conversations/[id]/page.tsx.
export default function ConversationLoading() {
  return (
    <div className="flex h-full" role="status">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
          <Skeleton className="h-16 w-3/5 rounded-2xl" />
          <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
          <Skeleton className="h-12 w-1/2 rounded-2xl" />
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <aside className="w-80 shrink-0 border-l border-slate-200 bg-white px-6 py-6">
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 space-y-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          ))}
        </div>
      </aside>

      <span className="sr-only">Loading</span>
    </div>
  );
}
