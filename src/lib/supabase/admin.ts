import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * SIKKERHET: Denne klienten omgår Row Level Security.
 * Den skal KUN brukes i signaturverifiserte kontekster:
 *   - Stripe-webhooks (etter verifisering av webhook-signatur)
 *   - Cron-jobber (etter verifisering av CRON_SECRET)
 *   - GDPR-sletting (etter at brukeren selv er autentisert og har bekreftet)
 * Aldri importer denne i kode som svarer på vanlige brukerforespørsler.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
