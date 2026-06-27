# 15 · Design system (anti-AI-slop rules)

The generic "AI-built" look comes from letting the tool make the creative calls. This file is the
system we implement against, so the product reads as deliberately designed, not auto-generated.
Every UI change must obey these. When a quick fix conflicts with the system, the system wins.

## Palette
- Near-monochrome base: white, `slate` neutrals, and ink (`brand-900`) for text.
- One accent only: the steel-blue `brand` scale (see `tailwind.config.ts`), used sparingly for
  primary actions and key emphasis.
- Never use Tailwind `indigo`, `violet`, or `purple`. No gradients. Solid colors only.

## Typography
- Two families, never one for everything:
  - Marketing headings (landing, legal, marketing sections): `font-display` (Fraunces, a serif),
    for editorial contrast and gravitas.
  - Body, and all dense app UI (dashboard, forms): `font-sans` (Public Sans).
- Build hierarchy with size and weight, not color tricks. Strong, large H1; distinctly smaller
  H2/H3. Vary sizes across sections; avoid one uniform heading size everywhere.

## Components and shape
- Primary buttons: `rounded-md` at most. No pill-shaped (`rounded-full`) primary actions.
- Inputs and cards: square or lightly rounded (`rounded-md` / `rounded-lg`).
- Avoid stock AI-landing motifs, especially the "pill badge with a pulsing dot" hero label.

## Depth and effects
- Shadows: `shadow-sm` at most. No `shadow-md` or larger on resting or hover states.
- No ambient blur, no `backdrop-blur`, no glow. Build hierarchy with borders and whitespace.

## Motion
- Hover is a simple color fade, about 150ms (`transition-colors duration-150`).
- No scale-ups, bounces, or spring animations.

## Layout
- Avoid perfectly symmetrical, repetitive marketing card grids. No three-card "feature deck."
- Prefer asymmetric, editorial compositions (a two-column hero, a left-aligned statement, a
  text-plus-action split).
- Functional product surfaces (for example a dashboard KPI strip) may use a consistent grid; the
  anti-symmetry rule targets marketing and content sections.

## Copy
- Humanized and specific. Write like the person who runs the business talking to a dentist.
- No filler superlatives or security theater ("relentlessly secure", "next-level", "seamless",
  "powerful", "cutting-edge"). Say the concrete thing instead.
- Zero emojis in the UI or in code comments.
- Never use em dashes (see the writing-style rule in `CLAUDE.md`). Use commas, periods, parentheses.

## Where this is wired
- Fonts load in `src/app/layout.tsx`; `font-display` is mapped in `tailwind.config.ts`.
- Brand palette lives in `tailwind.config.ts` (`colors.brand`).
- Reference implementation: the landing page, `src/app/page.tsx`.
