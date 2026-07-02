"use client";

import { useEffect, useRef, useState } from "react";

// One-time scroll reveal for marketing pages: content fades in and rises at
// most 16px as it enters the viewport (rules in docs/15-design-system.md).
// The hidden state only applies when <html> has the `js` class (set inline in
// layout), so nothing is ever hidden without JavaScript, and
// prefers-reduced-motion disables the effect entirely in CSS.
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={`${visible ? "is-visible " : ""}${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
