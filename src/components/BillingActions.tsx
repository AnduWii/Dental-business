"use client";

import { useState } from "react";

// Buttons that kick off Stripe Checkout or open the Billing Portal. Each posts
// to its API route and redirects to the hosted Stripe URL it returns.
export function BillingActions({ hasCustomer }: { hasCustomer: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function go(path: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => go("/api/stripe/checkout")}
        className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "Please wait" : hasCustomer ? "Restart subscription" : "Start subscription"}
      </button>
      {hasCustomer ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => go("/api/stripe/portal")}
          className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:opacity-60"
        >
          Manage billing
        </button>
      ) : null}
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
