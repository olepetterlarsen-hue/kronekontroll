/**
 * Referansesatser for inkassokontrollen.
 *
 * KILDE OG VEDLIKEHOLD: Satsene under er avledet av inkassoforskriften og
 * justeres jevnlig av myndighetene (inkassosatsen fastsettes normalt årlig).
 * Oppdater tallene her når nye satser kunngjøres - se lovdata.no
 * (forskrift til inkassoloven) og Finanstilsynet. Datoen under skal alltid
 * oppdateres samtidig, og vises til brukeren i inkassokontrollen.
 *
 * Kontrollen flagger AVVIK til manuell vurdering. Den konkluderer aldri
 * juridisk - det står i UI-teksten.
 */
export const INKASSO_SATSER = {
  sistOppdatert: "2026-07-11",

  /** Maks purregebyr per purring (kr). */
  maksPurregebyr: 35,

  /**
   * Veiledende maksimalt inkassosalær som andel av hovedkravet for små krav.
   * Faktiske maksbeløp følger en trappetrinnsmodell basert på inkassosatsen -
   * kontrollen bruker en konservativ terskel og flagger til manuell sjekk.
   */
  salaerVarselTerskel: 0.5, // flagg hvis salær > 50 % av hovedkravet
  salaerVarselTerskelSmaaKrav: 1.0, // for krav under 500 kr: flagg hvis salær > hovedkravet

  /** Minste antall dager betalingsfrist et inkassovarsel skal gi. */
  minFristDagerInkassovarsel: 14,
} as const;

export interface InkassoFlagg {
  kode: "hoyt_salaer" | "hoyt_purregebyr" | "kort_frist" | "sum_stemmer_ikke";
  tekst: string;
}

/** Kjør kontrollen på et tolket inkassokrav. Returnerer liste med avvik å vurdere. */
export function kontrollerInkassokrav(krav: {
  hovedkrav: number;
  purregebyr: number;
  salaer: number;
  renter: number;
  totalkrav: number;
}): InkassoFlagg[] {
  const flagg: InkassoFlagg[] = [];
  const s = INKASSO_SATSER;

  if (krav.purregebyr > s.maksPurregebyr) {
    flagg.push({
      kode: "hoyt_purregebyr",
      tekst: `Purregebyret (${krav.purregebyr} kr) er høyere enn maksgebyret per ${s.sistOppdatert} (${s.maksPurregebyr} kr per purring). Sjekk om det er lagt på flere gebyrer enn tillatt.`,
    });
  }

  const terskel =
    krav.hovedkrav < 500 ? s.salaerVarselTerskelSmaaKrav : s.salaerVarselTerskel;
  if (krav.hovedkrav > 0 && krav.salaer > krav.hovedkrav * terskel) {
    flagg.push({
      kode: "hoyt_salaer",
      tekst: `Inkassosalæret (${krav.salaer} kr) er høyt i forhold til hovedkravet (${krav.hovedkrav} kr). Maksimalsatsene er regulert i inkassoforskriften - dette bør du få sjekket eller bestride.`,
    });
  }

  const sum = krav.hovedkrav + krav.purregebyr + krav.salaer + krav.renter;
  if (Math.abs(sum - krav.totalkrav) > 1) {
    flagg.push({
      kode: "sum_stemmer_ikke",
      tekst: `Delbeløpene (${sum.toFixed(0)} kr) stemmer ikke med totalkravet (${krav.totalkrav.toFixed(0)} kr). Be om spesifisert oppstilling av kravet.`,
    });
  }

  return flagg;
}
