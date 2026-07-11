import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe-webhook. SIKKERHET: signaturen verifiseres FØR noe annet skjer,
 * og først deretter brukes admin-klienten (service role) til å synke status.
 * Handleren er idempotent: samme event kan trygt leveres flere ganger.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Mangler signatur", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe().webhooks.constructEvent(body, signature, env.stripeWebhookSecret());
  } catch {
    return new Response("Ugyldig signatur", { status: 400 });
  }

  const admin = createAdminClient();

  const oppdaterProfil = async (
    userId: string,
    felter: Record<string, string | null>,
  ) => {
    await admin.from("profiles").update(felter).eq("id", userId);
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      if (userId && typeof session.customer === "string") {
        await oppdaterProfil(userId, {
          stripe_customer_id: session.customer,
          subscription_status: "active",
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = sub.metadata?.supabase_user_id;
      if (userId) {
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due" || sub.status === "unpaid"
              ? "past_due"
              : "canceled";
        await oppdaterProfil(userId, { subscription_status: status });
      }
      break;
    }
    default:
      // Andre eventer bekreftes uten handling
      break;
  }

  return Response.json({ received: true });
}
