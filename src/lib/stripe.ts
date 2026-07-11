import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

export function stripe() {
  return new Stripe(env.stripeSecretKey());
}

/**
 * Abonnementstilgang: aktivt abonnement ELLER gyldig prøveperiode.
 * past_due gis en mild sperre i UI (betalingsvarsel), men beholder lesetilgang -
 * vi låser aldri folk ute fra egne data.
 */
export function harTilgang(profile: {
  subscription_status: string;
  trial_ends_at: string;
}): { tilgang: boolean; grunn: "aktiv" | "prove" | "utlopt" | "betaling_feilet" } {
  if (profile.subscription_status === "active") return { tilgang: true, grunn: "aktiv" };
  if (profile.subscription_status === "past_due")
    return { tilgang: true, grunn: "betaling_feilet" };
  if (
    profile.subscription_status === "trial" &&
    new Date(profile.trial_ends_at).getTime() > Date.now()
  ) {
    return { tilgang: true, grunn: "prove" };
  }
  return { tilgang: false, grunn: "utlopt" };
}
