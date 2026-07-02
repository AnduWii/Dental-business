import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Reveal } from "@/components/Reveal";

function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon.png" alt="" className={className} />
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-brand-900">
              {BRAND.name}
              <span className="align-top text-[0.6em] font-normal text-slate-400">™</span>
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a
              href="#how"
              className="hidden font-medium text-slate-600 transition-colors duration-150 hover:text-slate-900 sm:block"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="font-medium text-slate-600 transition-colors duration-150 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-brand-600 px-4 py-2 font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
            >
              Start a pilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1080px] items-center gap-16 px-8 pb-24 pt-28 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Missed-call recovery for dental clinics
            </p>
          </Reveal>
          <Reveal className="mt-6" delay={80}>
            <h1 className="font-display text-[48px] font-semibold leading-[1.0] tracking-[-0.02em] text-brand-900 sm:text-[64px]">
              Get more patients from the calls you already{" "}
              <em className="italic text-brand-600">miss</em>.
            </h1>
          </Reveal>
          <Reveal className="mt-6" delay={160}>
            <p className="max-w-[32em] text-lg leading-relaxed text-slate-600">
              When a call to your clinic goes unanswered, {BRAND.name} texts the caller back, asks
              what they need, and pages your front desk, so they book with you instead of the
              dentist down the road.
            </p>
          </Reveal>
          <Reveal className="mt-8" delay={240}>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-brand-600 px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
              >
                Start your 14-day pilot
              </Link>
              <a
                href="#how"
                className="rounded-md border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50"
              >
                How it works
              </a>
            </div>
          </Reveal>
          <Reveal className="mt-5" delay={320}>
            <div className="flex items-center gap-3.5 text-[13px] text-slate-400">
              <span>Free setup</span>
              <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
              <span>No contract</span>
              <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
              <span>Cancel anytime</span>
            </div>
          </Reveal>
        </div>

        {/* Live recovery card: the conversation plays itself out on arrival */}
        <Reveal className="relative" delay={160}>
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-brand-100 bg-brand-50"
          />
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-800">
                MA
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-brand-900">Maria Alvarez</div>
                <div className="text-[11px] text-slate-400">(617) 555-0142</div>
              </div>
              <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
                Emergency
              </span>
            </div>
            <div className="flex flex-col gap-2.5 bg-[#fbfcfe] p-4">
              <Reveal
                className="self-center text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400"
                delay={600}
              >
                Missed call · 12:41 PM
              </Reveal>
              <Reveal
                className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-brand-600 px-3 py-2 text-[13px] text-white"
                delay={1000}
              >
                Hi, this is Dr. Okafor&apos;s office. Sorry we missed your call. How can we help?
                <div className="mt-1 text-[10px] text-white/70">Instant text-back</div>
              </Reveal>
              <Reveal
                className="max-w-[78%] self-start rounded-[14px_14px_14px_4px] border border-slate-100 bg-white px-3 py-2 text-[13px] text-brand-900"
                delay={2100}
              >
                Hi, I cracked a molar at lunch and it really hurts. Can I be seen today?
              </Reveal>
              <Reveal
                className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-brand-600 px-3 py-2 text-[13px] text-white"
                delay={3300}
              >
                So sorry, Maria. Dr. Okafor has a 2:30 emergency slot. Want me to hold it?
                <div className="mt-1 text-[10px] text-white/70">Autopilot, just now</div>
              </Reveal>
              <Reveal
                className="max-w-[78%] self-start rounded-[14px_14px_14px_4px] border border-slate-100 bg-white px-3 py-2 text-[13px] text-brand-900"
                delay={4400}
              >
                Yes please!
              </Reveal>
            </div>
            <Reveal
              className="flex items-center gap-2.5 border-t border-slate-100 bg-white px-4 py-3"
              delay={5300}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </span>
              <div className="text-xs text-slate-600">
                <strong className="text-brand-900">Front desk paged.</strong> Maria wants the 2:30
                slot, and your team has the whole story.
              </div>
            </Reveal>
          </div>
        </Reveal>
      </section>

      {/* Why it matters */}
      <section id="how" className="border-t border-slate-200 bg-slate-50 py-24">
        <div className="mx-auto max-w-[860px] px-8">
          <Reveal>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              How it works
            </p>
          </Reveal>
          <Reveal className="mt-4" delay={100}>
            <h2 className="max-w-[15em] font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.01em] text-brand-900 sm:text-[44px]">
              A catch line for patients that slip through the cracks.
            </h2>
          </Reveal>
          <Reveal className="mt-6" delay={200}>
            <p className="max-w-[40em] text-lg leading-relaxed text-slate-600">
              When your line goes unanswered, {BRAND.name} texts the caller back from a dedicated
              number, asks what they need, and pages your front desk, so they book with you before
              they call the next clinic down the road.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Offer */}
      <section className="py-24">
        <div className="mx-auto max-w-[1080px] px-8">
          <div className="grid items-center gap-10 border-t border-slate-200 pt-14 md:grid-cols-[1fr_auto]">
            <Reveal>
              <h2 className="font-display text-[28px] font-semibold tracking-[-0.01em] text-brand-900 sm:text-[34px]">
                See it on your own line first.
              </h2>
              <p className="mt-4 max-w-[42em] text-base leading-relaxed text-slate-600">
                We start with a 14-day pilot on your real phone number. If it recovers patients, you
                continue at <span className="font-semibold text-brand-900">$150 CAD per month</span>.
                If it doesn&apos;t, we take it off and you owe nothing.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <Link
                href="/signup"
                className="inline-block shrink-0 rounded-md bg-brand-600 px-7 py-3.5 font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
              >
                Start a pilot
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-8 text-[13px] text-slate-400">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}.
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
          <Link href="/terms" className="transition-colors duration-150 hover:text-slate-600">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors duration-150 hover:text-slate-600">
            Privacy
          </Link>
          <Link href="/dpa" className="transition-colors duration-150 hover:text-slate-600">
            Data Processing Agreement
          </Link>
        </div>
      </footer>
    </main>
  );
}
