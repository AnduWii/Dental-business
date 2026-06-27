import { getDashboardContext } from "@/lib/auth";
import { stripeConfigured } from "@/lib/stripe";
import { BillingActions } from "@/components/BillingActions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pilot: "Pilot",
  active: "Active",
  paused: "Payment needed",
  canceled: "Canceled",
};

export default async function BillingPage() {
  const { clinic } = await getDashboardContext();
  if (!clinic) return null;

  const configured = stripeConfigured();
  const status = clinic.subscription_status;
  const hasCustomer = Boolean(clinic.stripe_customer_id);

  return (
    <div className="scroll-area h-full overflow-y-auto bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold text-brand-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Your Catchline plan and payment details.</p>
      </header>

      <div className="mx-auto max-w-2xl px-8 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current plan
              </p>
              <p className="mt-1 text-lg font-semibold text-brand-900">
                {STATUS_LABEL[status] ?? status}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              $150 CAD / month
            </span>
          </div>

          {status === "pilot" && clinic.pilot_ends_at ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Your 14-day pilot runs until {formatDateTime(clinic.pilot_ends_at)}. Start your
              subscription any time to keep Catchline running after that.
            </p>
          ) : null}
          {clinic.current_period_end && (status === "active" || status === "canceled") ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {status === "canceled" ? "Access ends" : "Renews"} on{" "}
              {formatDateTime(clinic.current_period_end)}.
            </p>
          ) : null}

          <div className="mt-6">
            {configured ? (
              <BillingActions hasCustomer={hasCustomer} />
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Billing is not connected yet. Add the Stripe keys in Vercel and redeploy to turn on
                checkout.
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Payments are processed securely by Stripe. We never see or store your card details.
        </p>
      </div>
    </div>
  );
}
