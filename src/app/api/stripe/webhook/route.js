import Stripe from "stripe";
import { createServiceClient } from "../../../../lib/supabase/service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("WEBHOOK SIGNATURE ERROR:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode === "subscription") {
          const userId = session.metadata?.supabase_user_id;
          const subscriptionId = session.subscription;
          const customerId = session.customer;

          if (userId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const { error } = await supabase
              .from("profiles")
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: subscription.status,
              })
              .eq("id", userId);

            if (error) {
              console.error("SUPABASE UPDATE ERROR:", error);
            }
          }
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("SUPABASE SUBSCRIPTION UPDATE ERROR:", error);
        }

        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("WEBHOOK PROCESSING ERROR:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }
}