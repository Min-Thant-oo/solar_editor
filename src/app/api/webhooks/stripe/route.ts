import { headers } from "next/headers";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  console.log("Webhook received");

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  console.log("Webhook signature:", signature ? "Present" : "Missing");

  let event: Stripe.Event;

  try {
    console.log("Attempting to construct webhook event");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Webhook event constructed successfully:", event.type);
  } catch (err) {
    console.error("Webhook construction failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }
  
  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata) {
      console.error("Metadata is null or undefined in the session object");
      return new Response("Missing metadata", { status: 400 });
    }
    
    // Extract relevant data
    const stripeOrderId = session.payment_intent as string; // Stripe order ID
    try {
      const result = await convex.mutation(api.users.upgradeToPro, {
        email: session.metadata.email,
        stripeOrderId: stripeOrderId,
      });
      console.log("Purchase ticket mutation completed:", result);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}