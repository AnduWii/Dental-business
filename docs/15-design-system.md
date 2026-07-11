# 15 · Design system (anti-AI-slop rules)

The generic "AI-built" look comes from letting the tool make the creative calls. This file is the
system we implement against, so the product reads as deliberately designed, not auto-generated.
Every UI change must obey these. When a quick fix conflicts with the system, the system wins.

## Palette
- Near-monochrome base: white, `slate` neutrals, and ink (`brand-900`) for text.
- One accent only: the steel-blue `brand` scale (see `tailwind.config.ts`), used sparingly for
  primary actions and key emphasis.
- Semantic tints are allowed in small doses (chips, badges, status): red for emergency, emerald
  for success, amber for missed/warning. Never as section colors or decoration.
- Ink bands (`brand-900` background) are the page's dark counterpoint: at most one per marketing
  page (currently the pricing band). On ink, flat offset outlines are allowed for note cards (a
  hard `8px 8px 0` shadow with zero blur); this is a border treatment, not an elevation effect.
  Blur stays banned everywhere.
- No boxed feature/inclusion grids of any count (the owner rejects 3-up and 4-up card grids on
  sight), and no mono "log ticker" strips with arrow chains. Render lists as prose sentences.
- Never use Tailwind `indigo`, `violet`, or `purple`. No gradients. Solid colors only.

## Typography
- Three voices, each with one job:
  - Marketing headings (landing, legal, marketing sections): `font-display` (Young Serif). It
    ships a single weight: build hierarchy with size, never bold it, and don't italicize it (no
    italic cut; use color for emphasis instead). Fraunces, then Newsreader, were retired after
    becoming AI-generated-site tells; if Young Serif ever reaches that status, swap again.
  - Body, and all dense app UI (dashboard, forms): `font-sans` (Public Sans).
  - Micro-labels, timestamps, and log-style captions on marketing pages: `font-mono`
    (Fragment Mono), the "switchboard" voice. Uppercase, small (9 to 12px), tracked, and never
    bolded (the family ships one weight). Use it for eyebrows, chips, tickers, and annotation
    lines, not for body text.
- Avoid AI-default fonts entirely: Inter, Fraunces, Newsreader (retired here), and Instrument
  Serif are tells.
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
- Scroll reveals are allowed on **marketing pages only** (`src/components/Reveal.tsx`): a one-time
  fade plus a rise of at most 16px, 400 to 600ms ease-out, staggered by small delays, and fully
  disabled under `prefers-reduced-motion`. App surfaces (dashboard, forms) stay still.
- No parallax, no scroll-jacking, no 3D or WebGL effects.

## Layout
- Avoid perfectly symmetrical, repetitive marketing card grids. No three-card "feature deck."
- Prefer asymmetric, editorial compositions (a two-column hero, a left-aligned statement, a
  text-plus-action split).
- Functional product surfaces (for example a dashboard KPI strip) may use a consistent grid; the
  anti-symmetry rule targets marketing and content sections.

## Copy
- Display headings never end in a period. The short declarative headline with a trailing full
  stop is an AI-copy tell. Questions keep their question mark; body copy keeps normal punctuation.
- Humanized and specific. Write like the person who runs the business talking to a dentist.
- No filler superlatives or security theater ("relentlessly secure", "next-level", "seamless",
  "powerful", "cutting-edge"). Say the concrete thing instead.
- Zero emojis in the UI or in code comments.
- Never use em dashes (see the writing-style rule in `CLAUDE.md`). Use commas, periods, parentheses.

## Where this is wired
- Fonts load in `src/app/layout.tsx`; `font-display` is mapped in `tailwind.config.ts`.
- Brand palette lives in `tailwind.config.ts` (`colors.brand`).
- Reference implementation: the landing page, `src/app/page.tsx`.
