import { env } from "@/lib/env";
import type { Kontoutskrift } from "@/lib/schemas";

/**
 * Abstraksjon for hvordan kontodata kommer inn i Kronekontroll.
 * I dag: manuell opplasting (ManualUploadProvider).
 * Fremtid: automatisk banksynk via Tink som betalt tillegg (plan "pluss") -
 * TinkProvider under er en stub bak feature-flagget ENABLE_TINK.
 */
export interface BankDataProvider {
  readonly id: "manual" | "tink";
  /** Om leverandøren kan hente data selv, eller er avhengig av opplasting. */
  readonly automatisk: boolean;
  /**
   * Henter transaksjoner for en bruker. For manuell opplasting skjer dette
   * via import-flyten (AI-tolkning), så metoden er ikke i bruk der.
   */
  hentTransaksjoner(userId: string, fra: Date, til: Date): Promise<Kontoutskrift | null>;
}

export const manualUploadProvider: BankDataProvider = {
  id: "manual",
  automatisk: false,
  async hentTransaksjoner() {
    // Manuell flyt: brukeren laster opp kontoutskrift som tolkes i /api/import/parse.
    return null;
  },
};

/**
 * STUB for fremtidig Tink-integrasjon (open banking via lisensiert AISP).
 * Når dette bygges ut:
 *  1. OAuth-flyt mot Tink Link: redirect til Tink, callback-rute lagrer
 *     access/refresh-token kryptert per bruker (egen tabell med RLS).
 *  2. hentTransaksjoner kaller Tinks transactions-API og mapper til
 *     Kontoutskrift-skjemaet (gjenbruk kategorisering fra AI-laget ved behov).
 *  3. Gated på plan = 'pluss' (Stripe-prisnivå STRIPE_PRICE_ID_PLUSS).
 */
export const tinkProvider: BankDataProvider = {
  id: "tink",
  automatisk: true,
  async hentTransaksjoner() {
    throw new Error("Tink-integrasjonen er ikke aktivert (ENABLE_TINK=false).");
  },
};

export function aktivBankProvider(): BankDataProvider {
  return env.enableTink() ? tinkProvider : manualUploadProvider;
}
