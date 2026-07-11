import { authErrorResponse, requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/** Stripe Customer Portal: bytt kort, se fakturaer, si opp - like lett som å kjøpe. */
export async function POST() {
  try {
    const { user, supabase } = await requireUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return Response.json({ error: "Ingen betalingsprofil ennå" }, { status: 404 });
    }

    const session = await stripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${env.appUrl()}/app/innstillinger`,
    });

    return Response.json({ url: session.url });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Kunne ikke åpne betalingsportalen" }, { status: 500 });
  }
}
