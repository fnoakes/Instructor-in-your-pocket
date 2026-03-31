import Stripe from "stripe";
import { createServiceClient } from "../../../../lib/supabase/service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getSubscriptionFields(subscription) {
  return {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status || "free",
    price_id: subscription.items?.data?.[0]?.price?.id || null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
  };
}

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    const rawBody = await request.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("STRIPE WEBHOOK SIGNATURE ERROR:", error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.mode === "subscription") {
          const customerId = session.customer;
          const subscriptionId = session.subscription;
          const userId =
            session.metadata?.supabase_user_id ||
            session.subscription_details?.metadata?.supabase_user_id ||
            null;

          if (customerId && userId && subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const { error } = await supabase
              .from("profiles")
              .update({
                stripe_customer_id: customerId,
                ...getSubscriptionFields(subscription),
              })
              .eq("id", userId);

            if (error) {
              console.error("WEBHOOK PROFILE UPDATE ERROR:", error);
            }
          }
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { error } = await supabase
          .from("profiles")
          .update({
            ...getSubscriptionFields(subscription),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("WEBHOOK SUBSCRIPTION SYNC ERROR:", error);
        }

        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("STRIPE WEBHOOK HANDLER ERROR:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}