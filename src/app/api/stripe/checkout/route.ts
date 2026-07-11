import { authErrorResponse, requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/** Oppretter Stripe Checkout-sesjon for abonnementet (49 kr/mnd). */
export async function POST() {
  try {
    const { user, supabase } = await requireUser();
    const s = stripe();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await s.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      // stripe_customer_id kan ikke settes av brukerens klient (kolonnegrants),
      // så webhooken er sannhetskilden. Vi sender id-en med i checkout-metadata.
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: env.stripePriceStandard(), quantity: 1 }],
      locale: "nb",
      success_url: `${env.appUrl()}/app?betaling=fullfort`,
      cancel_url: `${env.appUrl()}/app/innstillinger?betaling=avbrutt`,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      metadata: { supabase_user_id: user.id },
      // Angrerett: opplyses i checkout-flaten og i vilkårene
      custom_text: {
        submit: {
          message:
            "Du har 14 dagers angrerett. Abonnementet kan sies opp når som helst under Innstillinger.",
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Kunne ikke starte betaling" }, { status: 500 });
  }
}
