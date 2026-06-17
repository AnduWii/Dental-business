import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-brand-600">{BRAND.name}</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-slate-600 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Start a pilot
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
          For dental clinics
        </p>
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
          Stop losing patients you&apos;ve already paid to reach.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          When a call to your clinic goes unanswered, {BRAND.name} instantly texts the caller back,
          finds out what they need, and pages your front desk — so they book with you instead of
          the dentist down the road.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Start your 14-day pilot
          </Link>
          <a
            href="#how"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-white"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Free setup · No contract · Cancel anytime
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold">Every missed call, recovered</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Call goes unanswered",
                body: "Your line forwards missed and after-hours calls to your Recall number. Nothing changes for your staff.",
              },
              {
                step: "2",
                title: "Patient gets a text",
                body: "Within seconds the caller receives a friendly text from your clinic. The conversation continues over SMS.",
              },
              {
                step: "3",
                title: "You get the lead",
                body: "Recall captures their name, reason, urgency and booking intent, then pages your front desk to close.",
              },
            ].map((c) => (
              <div key={c.step} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600">
                  {c.step}
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof / offer */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold">See it on your own line first</h2>
          <p className="mt-4 text-slate-600">
            We start with a 14-day pilot on your real phone number. If it recovers patients, you
            continue at <span className="font-semibold">$299/month</span>. If it doesn&apos;t, we
            remove it and you owe nothing.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Start a pilot
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}
      </footer>
    </main>
  );
}
