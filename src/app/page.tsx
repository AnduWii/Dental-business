import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Reveal } from "@/components/Reveal";
import { BrandMark } from "@/components/BrandMark";

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

function Plus({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Does my clinic's phone number change?",
    a: "No. You keep your current number, your staff, and your phone system. Your carrier forwards unanswered or busy calls to a dedicated Catchline number we set up for you, usually after about four rings. Turn the forwarding off and everything is back to exactly how it was.",
  },
  {
    q: "What do patients see when we text back?",
    a: "A text from your dedicated Catchline number that opens with your clinic's name, so it reads like your office texting back. The whole conversation continues on that number.",
  },
  {
    q: "Will the AI give dental advice or book appointments?",
    a: "No. It handles administrative intake only: name, reason for calling, urgency, and whether they want to book. It never gives clinical advice, quotes prices, or books times. If a message suggests an emergency, the caller is told to call 911 and your team is paged immediately. A person always does the booking.",
  },
  {
    q: "Where is patient data stored?",
    a: "In Canada, in a Montreal data region, with retention limits and an append-only audit log. The full details are in our Privacy Policy and the clinic Data Processing Agreement, both linked below.",
  },
  {
    q: "What happens after hours?",
    a: "The same thing that happens at lunch. The 9 PM caller gets a text back within seconds, the conversation captures what they need, and your front desk opens the morning with the whole story instead of a hang-up in the call log.",
  },
  {
    q: "What does it cost, and how do I cancel?",
    a: "The first 14 days on your real line are free. After that it is $150 CAD per month, no contract, cancel anytime. If the pilot doesn't recover patients, we take it off your line and you owe nothing.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-brand-900">
              {BRAND.name}
              <span className="align-top text-[0.6em] font-normal text-slate-400">™</span>
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
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
      <section className="mx-auto grid max-w-[1080px] items-center gap-16 px-8 pb-20 pt-24 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Missed-call recovery for dental clinics
            </p>
          </Reveal>
          <Reveal className="mt-6" delay={80}>
            <h1 className="font-display text-[44px] leading-[1.04] tracking-[-0.01em] text-brand-900 sm:text-[58px]">
              Get more patients from the calls you already{" "}
              <em className="not-italic text-brand-500">miss</em>
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
            </div>
          </Reveal>
          <Reveal className="mt-5" delay={320}>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Free setup · No contract · Cancel anytime
            </p>
          </Reveal>
        </div>

        {/* Live recovery card: the conversation plays itself out on arrival.
            The AI flags and pages; a person offers the time (it never books). */}
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
                <div className="text-[11px] text-slate-400">(416) 555-0142</div>
              </div>
              <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
                Emergency
              </span>
            </div>
            <div className="flex flex-col gap-2.5 bg-[#fbfcfe] p-4">
              <Reveal
                className="self-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-800"
                delay={600}
              >
                Missed call · 12:41 PM
              </Reveal>
              <Reveal
                className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-brand-600 px-3 py-2 text-[13px] text-white"
                delay={1000}
              >
                Hi, this is Dr. Okafor&apos;s office. Sorry we missed your call. How can we help?
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70">
                  Instant text-back
                </div>
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
                That sounds painful, Maria. I&apos;ve marked this urgent and paged the front desk.
                If they can fit you in today, what time works?
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70">
                  Autopilot, intake only
                </div>
              </Reveal>
              <Reveal
                className="max-w-[78%] self-start rounded-[14px_14px_14px_4px] border border-slate-100 bg-white px-3 py-2 text-[13px] text-brand-900"
                delay={4400}
              >
                Anytime after 1, please.
              </Reveal>
              <Reveal
                className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-slate-900 px-3 py-2 text-[13px] text-white"
                delay={5400}
              >
                Hi Maria, it&apos;s Sana at the front desk. We can take you at 2:30 today. Want it?
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70">
                  Your staff, taking over
                </div>
              </Reveal>
            </div>
            <Reveal
              className="flex items-center gap-2.5 border-t border-slate-100 bg-white px-4 py-3"
              delay={6300}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </span>
              <div className="text-xs text-slate-600">
                <strong className="text-brand-900">Front desk paged.</strong> The lead was captured
                before anyone picked up a phone.
              </div>
            </Reveal>
          </div>
          <Reveal
            className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400"
            delay={6900}
          >
            Two minutes, reconstructed · Example conversation
          </Reveal>
        </Reveal>
      </section>

      {/* The slogan statement */}
      <section className="py-24">
        <div className="mx-auto max-w-[860px] px-8">
          <Reveal>
            <h2 className="max-w-[16em] font-display text-[32px] leading-[1.1] tracking-[-0.01em] text-brand-900 sm:text-[42px]">
              A catch line for patients that slip through the cracks
            </h2>
          </Reveal>
          <Reveal className="mt-6" delay={120}>
            <p className="max-w-[40em] text-lg leading-relaxed text-slate-600">
              When your line goes unanswered, {BRAND.name} texts the caller back from a dedicated
              Catchline number, holds a short conversation about what they need, and pages your
              front desk. You keep your current number, your staff, and your workflow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The part your team sees */}
      <section className="border-y border-slate-200 bg-slate-50 py-24">
        <div className="mx-auto grid max-w-[1080px] items-center gap-14 px-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Reveal>
              <h2 className="font-display text-[32px] leading-[1.1] tracking-[-0.01em] text-brand-900 sm:text-[40px]">
                The part your team sees
              </h2>
            </Reveal>
            <Reveal className="mt-5" delay={120}>
              <p className="text-lg leading-relaxed text-slate-600">
                Every recovered call lands in a shared inbox with the story already written: who
                called, why, how urgent, and whether they want to book. Your front desk opens a
                conversation, not a mystery.
              </p>
            </Reveal>
            <Reveal className="mt-4" delay={200}>
              <p className="text-[15px] leading-relaxed text-slate-500">
                Emergencies page the desk by text the moment they are flagged. Everything else
                waits politely in the queue.
              </p>
            </Reveal>
          </div>
          <Reveal delay={180}>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
                <span className="text-sm font-semibold text-brand-900">Inbox</span>
                <span className="font-mono text-[11px] text-slate-500">
                  <span className="text-red-600">1</span> needs attention ·{" "}
                  <span className="text-brand-600">4</span> active
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-brand-900">Maria Alvarez</span>
                    <span className="text-[11px] text-slate-400">2m ago</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-slate-600">
                    Cracked molar at lunch, in pain, wants today after 1
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                      Emergency
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      Needs attention
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Ready to book
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-brand-900">James Okonkwo</span>
                    <span className="text-[11px] text-slate-400">1h ago</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] text-slate-600">
                    Wants to move Thursday&apos;s cleaning to next week
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      Reschedule
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Handled
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-400">
                Example data · This is the live dashboard your clinic signs into
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The deal: dark pricing band */}
      <section className="bg-brand-900 py-24">
        <div className="mx-auto max-w-[1080px] px-8">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              See it on your own line first
            </p>
          </Reveal>
          <Reveal className="mt-6" delay={100}>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="font-display text-[80px] leading-none text-white sm:text-[104px]">
                $150
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
                CAD per month · After the free 14-day pilot
              </span>
            </div>
          </Reveal>
          <Reveal className="mt-6" delay={180}>
            <p className="max-w-[44em] text-[16px] leading-relaxed text-slate-300">
              We start with a 14-day pilot on your real phone number. If it recovers patients, you
              continue.{" "}
              <strong className="font-semibold text-white">
                If it doesn&apos;t, we take it off your line and you owe nothing.
              </strong>{" "}
              No contract, cancel anytime.
            </p>
          </Reveal>
          <Reveal className="mt-4" delay={240}>
            <p className="max-w-[44em] text-[16px] leading-relaxed text-slate-300">
              The price covers everything: your dedicated Catchline number (you keep your current
              one), the instant text-back and intake, front desk paging with the shared inbox and
              missed-call log, and setup done with you, including the call forwarding on your
              existing line.
            </p>
          </Reveal>
          <Reveal className="mt-10" delay={200}>
            <Link
              href="/signup"
              className="inline-block rounded-md bg-white px-7 py-3.5 font-semibold text-brand-900 transition-colors duration-150 hover:bg-slate-100"
            >
              Start a pilot
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-[860px] px-8">
          <Reveal>
            <h2 className="font-display text-[32px] leading-[1.1] tracking-[-0.01em] text-brand-900 sm:text-[40px]">
              Questions dentists actually ask
            </h2>
          </Reveal>
          <div className="mt-10">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={Math.min(i * 60, 240)}>
                <details className="group border-b border-slate-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <span className="text-[17px] font-semibold text-brand-900">{item.q}</span>
                    <Plus className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-open:rotate-45" />
                  </summary>
                  <p className="pb-6 pr-8 text-[15px] leading-relaxed text-slate-600">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-6" delay={120}>
            <p className="text-[13px] text-slate-400">
              The fine print lives in our{" "}
              <Link
                href="/terms"
                className="underline transition-colors duration-150 hover:text-slate-600"
              >
                Terms
              </Link>
              ,{" "}
              <Link
                href="/privacy"
                className="underline transition-colors duration-150 hover:text-slate-600"
              >
                Privacy Policy
              </Link>
              , and{" "}
              <Link
                href="/dpa"
                className="underline transition-colors duration-150 hover:text-slate-600"
              >
                Data Processing Agreement
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Sign-off */}
      <section className="pb-10">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
          A catch line for patients that slip through the cracks
        </p>
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
