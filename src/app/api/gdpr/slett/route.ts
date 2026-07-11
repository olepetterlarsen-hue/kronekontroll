import { NextRequest } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const SlettInput = z.object({ bekreftelse: z.literal("SLETT KONTOEN MIN") });

/**
 * GDPR sletterett: sletter ALT - filer i Storage, alle rader (cascade fra
 * auth.users), Stripe-abonnement/kunde og selve brukerkontoen.
 * Admin-klient brukes KUN etter at brukeren selv er autentisert og har
 * skrevet bekreftelsesteksten.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireUser();

    const body = SlettInput.safeParse(await request.json());
    if (!body.success) {
      return Response.json(
        { error: 'Skriv "SLETT KONTOEN MIN" for å bekrefte' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // 1. Kanseller Stripe-abonnement og slett kunden (stopper fremtidige trekk)
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();
    if (profile?.stripe_customer_id) {
      try {
        await stripe().customers.del(profile.stripe_customer_id);
      } catch {
        // Kunden kan allerede være slettet i Stripe - fortsett slettingen her
      }
    }

    // 2. Slett alle filer i brukerens mappe i Storage
    const { data: filer } = await admin.storage.from("dokumenter").list(user.id, { limit: 1000 });
    if (filer && filer.length > 0) {
      await admin.storage
        .from("dokumenter")
        .remove(filer.map((f) => `${user.id}/${f.name}`));
    }

    // 3. Slett brukeren - alle tabellrader følger med via on delete cascade
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return Response.json({ error: "Kunne ikke slette kontoen. Kontakt oss." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
