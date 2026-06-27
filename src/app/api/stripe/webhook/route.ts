// POST /api/stripe/webhook
// Stripe calls this when a subscription is created, updated, or canceled. We
// verify the signature, then sync the clinic's subscription_status and billing
// ids. Configure the endpoint in the Stripe dashboard and set STRIPE_WEBHOOK_SECRET.
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStripeSignature } from "@/lib/stripe";
import { env } from "@/lib/env";
import type { SubscriptionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// Map Stripe's subscription status onto our enum.
function mapStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      // past_due, unpaid, incomplete, paused, etc.
      return "paused";
  }
}

export async function POST(req: NextRequest) {
  const secret = env.stripeWebhookSecret();
  if (!secret) return new NextResponse("Stripe webhook not configured", { status: 503 });

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!verifyStripeSignature(payload, sig, secret)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  const admin = createAdminClient();
  const obj = event?.data?.object ?? {};

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const clinicId = obj.client_reference_id || obj.metadata?.clinic_id;
        if (clinicId) {
          await admin
            .from("clinics")
            .update({
              stripe_customer_id: obj.customer ?? null,
              stripe_subscription_id: obj.subscription ?? null,
              subscription_status: "active",
            })
            .eq("id", clinicId);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const clinicId = obj.metadata?.clinic_id;
        const status = mapStatus(event.type.endsWith("deleted") ? "canceled" : obj.status || "");
        const periodEnd = obj.current_period_end
          ? new Date(obj.current_period_end * 1000).toISOString()
          : null;
        const patch = {
          subscription_status: status,
          current_period_end: periodEnd,
          stripe_subscription_id: obj.id ?? null,
        };
        if (clinicId) await admin.from("clinics").update(patch).eq("id", clinicId);
        else if (obj.customer)
          await admin.from("clinics").update(patch).eq("stripe_customer_id", obj.customer);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return new NextResponse("Handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
