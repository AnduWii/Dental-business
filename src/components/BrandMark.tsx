// The Catchline mark (Wordmark B, "the catch line"): two fixed points and the
// single sagging stroke between them. It reads as a phone wire, a net that
// catches what falls, and a faint smile. One weight, no motion, survives 16px.
// The square version doubles as the app icon / favicon (src/app/icon.svg).
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1f2d3d" />
      <path
        d="M14 26 C 24 42, 40 42, 50 26"
        fill="none"
        stroke="#f0f4f8"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="26" r="4.5" fill="#f0f4f8" />
      <circle cx="50" cy="26" r="4.5" fill="#f0f4f8" />
    </svg>
  );
}
