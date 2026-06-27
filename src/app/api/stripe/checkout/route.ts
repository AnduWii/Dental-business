// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for the signed-in user's clinic and returns
// the hosted URL for the client to redirect to.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession, stripeConfigured } from "@/lib/stripe";
import { env } from "@/lib/env";
import type { Clinic } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Billing is not connected yet." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("clinic_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.clinic_id) return NextResponse.json({ error: "No clinic." }, { status: 400 });

  const { data: clinic } = await admin
    .from("clinics")
    .select("*")
    .eq("id", profile.clinic_id)
    .maybeSingle<Clinic>();
  if (!clinic) return NextResponse.json({ error: "No clinic." }, { status: 400 });

  try {
    const url = await createCheckoutSession({
      clinicId: clinic.id,
      customerId: clinic.stripe_customer_id,
      customerEmail: clinic.notify_email || user.email,
      successUrl: `${env.appUrl()}/billing?status=success`,
      cancelUrl: `${env.appUrl()}/billing?status=canceled`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 },
    );
  }
}
