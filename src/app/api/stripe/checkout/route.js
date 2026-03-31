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
      .select("id, email, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.email) {
      return Response.json({ error: "Profile email missing" }, { status: 400 });
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: profile.id,
        },
      });

      customerId = customer.id;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("id", profile.id);

      if (updateError) {
        return Response.json({ error: "Failed to save Stripe customer" }, { status: 500 });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=cancelled`,
      metadata: {
        supabase_user_id: profile.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: profile.id,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);
    return Response.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}