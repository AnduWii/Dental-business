import Link from "next/link";
import { BRAND } from "@/lib/constants";

function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon.png" alt="" className={className} />
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-brand-900">{BRAND.name}</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/login" className="font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Start a pilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — two columns: copy + live recovery card */}
      <section className="mx-auto grid max-w-[1080px] items-center gap-14 px-8 pb-16 pt-20 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Missed-call recovery for dental clinics
          </div>
          <h1 className="mt-5 text-[44px] font-bold leading-[1.05] tracking-tight text-brand-900 sm:text-[46px]">
            Stop losing patients you&apos;ve already paid to reach.
          </h1>
          <p className="mt-5 max-w-[30em] text-lg leading-relaxed text-slate-600">
            When a call to your clinic goes unanswered, {BRAND.name} texts the caller back, learns
            what they need, and pages your front desk — so they book with you instead of the dentist
            down the road.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-[9px] bg-brand-600 px-[22px] py-[13px] font-semibold text-white hover:bg-brand-700"
            >
              Start your 14-day pilot
            </Link>
            <a
              href="#how"
              className="rounded-[9px] border border-slate-300 bg-white px-[22px] py-[13px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              How it works
            </a>
          </div>
          <div className="mt-[18px] flex items-center gap-3.5 text-[13px] text-slate-400">
            <span>Free setup</span>
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
            <span>No contract</span>
            <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Live recovery card */}
        <div className="relative">
          <div className="absolute inset-0 translate-x-4 translate-y-[18px] rounded-[18px] bg-brand-50" />
          <div className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(31,45,61,0.12)]">
            {/* card header */}
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
            {/* conversation */}
            <div className="flex flex-col gap-2.5 bg-[#fbfcfe] p-4">
              <div className="max-w-[78%] self-start rounded-[14px_14px_14px_4px] border border-slate-100 bg-white px-3 py-2 text-[13px] text-brand-900 shadow-sm">
                Hi, I cracked a molar at lunch and it really hurts. Can I be seen today?
              </div>
              <div className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-brand-600 px-3 py-2 text-[13px] text-white">
                So sorry, Maria! Dr. Okafor has a 2:30 emergency slot. Want me to hold it?
                <div className="mt-1 text-[10px] text-white/70">Autopilot · just now</div>
              </div>
              <div className="max-w-[78%] self-start rounded-[14px_14px_14px_4px] border border-slate-100 bg-white px-3 py-2 text-[13px] text-brand-900 shadow-sm">
                Yes please!
              </div>
            </div>
            {/* lead captured */}
            <div className="flex items-center gap-2.5 border-t border-slate-100 bg-white px-4 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[13px] text-emerald-800">
                ✓
              </span>
              <div className="text-xs text-slate-600">
                <strong className="text-brand-900">Lead captured</strong> — emergency · ready to
                book · front desk paged
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-slate-100 bg-slate-50 py-[72px]">
        <div className="mx-auto max-w-[1080px] px-8">
          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            How it works
          </p>
          <h2 className="mt-2.5 text-center text-3xl font-bold tracking-tight text-brand-900">
            Every missed call, recovered
          </h2>
          <div className="mt-11 grid gap-5 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Call goes unanswered",
                body: "Your line forwards missed and after-hours calls to your Catchline number. Nothing changes for your staff.",
              },
              {
                n: "2",
                title: "The patient gets a text",
                body: "Within seconds the caller hears from your clinic, and the conversation continues over SMS.",
              },
              {
                n: "3",
                title: "You get the lead",
                body: "Catchline captures their name, reason, urgency and booking intent, then pages your front desk to close.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-[14px] border border-slate-200 bg-white p-[26px] shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-brand-50 text-base font-bold text-brand-600">
                  {s.n}
                </div>
                <h3 className="mt-[18px] text-[17px] font-semibold text-brand-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="py-[72px]">
        <div className="mx-auto max-w-[680px] px-8">
          <div className="rounded-[18px] border border-slate-200 bg-white p-10 text-center shadow-card">
            <h2 className="text-[26px] font-bold tracking-tight text-brand-900">
              See it on your own line first
            </h2>
            <p className="mx-auto mt-3.5 max-w-[34em] text-base leading-relaxed text-slate-600">
              We start with a 14-day pilot on your real phone number. If it recovers patients, you
              continue at <span className="font-bold text-brand-900">$299/month</span>. If it
              doesn&apos;t, we remove it and you owe nothing.
            </p>
            <Link
              href="/signup"
              className="mt-[26px] inline-block rounded-[9px] bg-brand-600 px-[26px] py-[13px] font-semibold text-white hover:bg-brand-700"
            >
              Start a pilot
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-7">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-8 text-[13px] text-slate-400">
          <span>
            © {new Date().getFullYear()} {BRAND.name} · {BRAND.tagline}
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-slate-300" />
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
