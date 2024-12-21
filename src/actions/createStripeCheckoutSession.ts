"use server";

import baseUrl from "@/lib/baseUrl";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../convex/_generated/api";
import { stripe } from "@/lib/stripe";

export default async function createStripeCheckoutSession() {

  const { userId } = await auth();
    if (!userId) throw new Error("Not authenticated");
  
    const convex = getConvexClient();
  
      // Get event details
      const user = await convex.query(api.users.getUser, { userId });
      if (!user) throw new Error("User not found");

      const metadata = {
        email: user.email,
      };

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create(
    {
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Code Editor Pro Plan',
              description: 'Get exclusive access to the entire platform for life',
            },
            unit_amount: 3900, // Price in cents
          },
          quantity: 1,
        },
      ],
      // 30 minutes (stripe checkout minimum expiration time)
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      mode: "payment",
      success_url: `${baseUrl}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata,
    },
  );

  return { sessionId: session.id, sessionUrl: session.url };
}