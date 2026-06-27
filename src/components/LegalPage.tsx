import Link from "next/link";
import { BRAND } from "@/lib/constants";

// ---------------------------------------------------------------------------
// A small, data-driven renderer for legal/policy pages (privacy, DPA).
// Content is supplied as plain strings so apostrophes/quotes don't need JSX
// escaping, and every page gets identical, readable prose styling + the same
// site header/footer chrome as the marketing site.
// ---------------------------------------------------------------------------

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string }
  | { type: "table"; columns: [string, string]; rows: Array<[string, string]> }
  | { type: "contact"; email: string };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

function LogoMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon.png" alt="" className="h-8 w-auto" />
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{block.text}</p>;
    case "ul":
      return (
        <ul className="mt-3 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <p className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[14px] leading-relaxed text-brand-900">
          {block.text}
        </p>
      );
    case "table":
      return (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="bg-slate-50 text-brand-900">
                <th className="border-b border-slate-200 px-4 py-2.5 font-semibold">
                  {block.columns[0]}
                </th>
                <th className="border-b border-slate-200 px-4 py-2.5 font-semibold">
                  {block.columns[1]}
                </th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="align-top">
                  <td className="border-b border-slate-100 px-4 py-2.5 font-medium text-brand-900">
                    {row[0]}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2.5 text-slate-600">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "contact":
      return (
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Email us at{" "}
          <a
            href={`mailto:${block.email}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {block.email}
          </a>
          .
        </p>
      );
  }
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-brand-900">{BRAND.name}</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[760px] px-8 py-14">
        <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-brand-900">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-slate-400">Last updated {updated}</p>
        {intro ? (
          <p className="mt-6 text-[16px] leading-relaxed text-slate-700">{intro}</p>
        ) : null}

        {sections.map((section, i) => (
          <section key={i} className="mt-10">
            <h2 className="text-xl font-bold tracking-tight text-brand-900">{section.heading}</h2>
            {section.blocks.map((block, j) => (
              <Block key={j} block={block} />
            ))}
          </section>
        ))}
      </article>

      <footer className="border-t border-slate-200 py-7">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-8 text-[13px] text-slate-400">
          <span>
            © {new Date().getFullYear()} {BRAND.name}
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
          <Link href="/terms" className="hover:text-slate-600">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-slate-600">
            Privacy
          </Link>
          <Link href="/dpa" className="hover:text-slate-600">
            Data Processing Agreement
          </Link>
        </div>
      </footer>
    </main>
  );
}
