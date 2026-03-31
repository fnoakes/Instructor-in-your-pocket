import Stripe from "stripe";
import { createServiceClient } from "../../../../lib/supabase/service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body || {};

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

   const supabase = createServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.stripe_customer_id) {
      return Response.json({ error: "No Stripe customer found for this user" }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error("STRIPE PORTAL ERROR:", error);
    return Response.json({ error: "Unable to create portal session" }, { status: 500 });
  }
}