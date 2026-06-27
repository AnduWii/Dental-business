// Stripe billing helpers. Server only. Uses the Stripe REST API over fetch so we
// avoid an extra dependency, and verifies webhook signatures manually with the
// documented scheme (the `t` and `v1` parts of the Stripe-Signature header).
import crypto from "crypto";
import { env } from "@/lib/env";

const API = "https://api.stripe.com/v1";

// True once the secret key and the recurring price are both configured.
export function stripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey() && env.stripePriceId());
}

async function stripePost(path: string, params: Record<string, string>) {
  const secret = env.stripeSecretKey();
  if (!secret) throw new Error("Stripe is not configured");
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe request failed (${res.status})`);
  }
  return data;
}

// Create a Checkout Session for the monthly subscription. Returns the hosted URL.
export async function createCheckoutSession(opts: {
  clinicId: string;
  customerEmail?: string | null;
  customerId?: string | null;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const priceId = env.stripePriceId();
  if (!priceId) throw new Error("Stripe price is not configured");

  const params: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    client_reference_id: opts.clinicId,
    "subscription_data[metadata][clinic_id]": opts.clinicId,
    "metadata[clinic_id]": opts.clinicId,
    allow_promotion_codes: "true",
  };
  if (opts.customerId) params.customer = opts.customerId;
  else if (opts.customerEmail) params.customer_email = opts.customerEmail;

  const session = await stripePost("/checkout/sessions", params);
  return session.url as string;
}

// Create a Billing Portal session so a clinic can manage or cancel its plan.
export async function createPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await stripePost("/billing_portal/sessions", {
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });
  return session.url as string;
}

// Verify a Stripe webhook signature. Header looks like "t=123,v1=abc...". We
// recompute HMAC-SHA256(secret, `${t}.${rawBody}`) and compare in constant time.
export function verifyStripeSignature(
  payload: string,
  sigHeader: string | null,
  secret: string,
): boolean {
  if (!sigHeader) return false;
  const parts: Record<string, string> = {};
  for (const kv of sigHeader.split(",")) {
    const [k, v] = kv.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    const a = Buffer.from(v1);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
