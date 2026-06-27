// POST /api/stripe/portal
// Creates a Stripe Billing Portal session so the clinic can manage or cancel
// its subscription, and returns the hosted URL.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPortalSession, stripeConfigured } from "@/lib/stripe";
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
  if (!clinic?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet. Start a subscription first." }, {
      status: 400,
    });
  }

  try {
    const url = await createPortalSession({
      customerId: clinic.stripe_customer_id,
      returnUrl: `${env.appUrl()}/billing`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not open the billing portal." },
      { status: 500 },
    );
  }
}
