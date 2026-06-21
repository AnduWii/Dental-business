// Reusable skeleton placeholder: one softly pulsing block. Compose several of
// these inside a route's loading.tsx to mirror the real layout while server
// data loads. Decorative, so hidden from screen readers (the loading.tsx
// container carries the accessible "Loading" status instead).
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}
