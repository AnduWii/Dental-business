import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-brand-700">{BRAND.name}</span>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
            >
              Start a pilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-400">
          Missed-call recovery for dental clinics
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900">
          Stop losing patients you&apos;ve already paid to reach.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          When a call to your clinic goes unanswered, {BRAND.name} texts the caller back, finds out
          what they need, and notifies your front desk — so they book with you instead of the
          dentist down the road.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Start your 14-day pilot
          </Link>
          <a
            href="#how"
            className="rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            How it works
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-400">Free setup · No contract · Cancel anytime</p>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Every missed call, recovered
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Call goes unanswered",
                body: "Your line forwards missed and after-hours calls to your Recall number. Nothing changes for your staff.",
              },
              {
                step: "2",
                title: "The patient gets a text",
                body: "Within seconds the caller receives a message from your clinic, and the conversation continues over SMS.",
              },
              {
                step: "3",
                title: "You get the lead",
                body: "Recall captures their name, reason, urgency and booking intent, then notifies your front desk to close.",
              },
            ].map((c) => (
              <div key={c.step} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                  {c.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* See it work — sample recovered conversation */}
      <section className="border-t border-slate-100 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">See it work</h2>
          <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed text-slate-600">
            A real missed call, recovered in seconds — texted back, triaged, and handed to your
            front desk with the details already captured.
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-semibold text-slate-900">Bright Smile Dental</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                Recall
              </span>
            </div>
            <div className="space-y-2.5">
              <Bubble side="out">
                Hi, this is Bright Smile Dental — sorry we missed your call! Reply here and we&apos;ll
                get you sorted. How can we help?
              </Bubble>
              <Bubble side="in">
                Hi! Saw you missed my call. My wisdom tooth area is really swollen since last night.
              </Bubble>
              <Bubble side="out">
                That can be a sign of infection and shouldn&apos;t wait. Any trouble breathing or
                swallowing? Either way I&apos;ll get you the first available visit.
              </Bubble>
              <Bubble side="in">No trouble breathing, just really sore.</Bubble>
              <Bubble side="out">
                Thanks — flagging this as urgent. Our front desk will text you a same-day time
                shortly. Can I get your name?
              </Bubble>
              <Bubble side="in">James Carter</Bubble>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2 text-xs">
            <Chip>James Carter</Chip>
            <Chip tone="red">Urgency: High</Chip>
            <Chip tone="teal">New patient</Chip>
            <Chip tone="green">Front desk paged</Chip>
          </div>
        </div>
      </section>

      {/* Offer */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">See it on your own line first</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            We start with a 14-day pilot on your real phone number. If it recovers patients, you
            continue at <span className="font-semibold text-slate-900">$299/month</span>. If it
            doesn&apos;t, we remove it and you owe nothing.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Start a pilot
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}
      </footer>
    </main>
  );
}

function Bubble({ side, children }: { side: "in" | "out"; children: React.ReactNode }) {
  const inbound = side === "in";
  return (
    <div className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
          inbound
            ? "rounded-bl-sm bg-slate-100 text-slate-800"
            : "rounded-br-sm bg-brand-600 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Chip({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "red" | "teal" | "green";
}) {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    red: "bg-red-100 text-red-800",
    teal: "bg-teal-100 text-teal-800",
    green: "bg-emerald-100 text-emerald-800",
  } as const;
  return <span className={`rounded-full px-2.5 py-1 font-medium ${map[tone]}`}>{children}</span>;
}
