/**
 * Veiledende eierkostnader for bil, brukt av Kjøpsplanleggeren.
 *
 * KILDE OG VEDLIKEHOLD: satsene er veiledende anslag basert på offentlige
 * avgiftssatser (Skatteetaten: omregistreringsavgift, trafikkforsikringsavgift)
 * og typiske markedspriser (forsikring, service, verdifall). De vises ALLTID
 * med "veiledende"-forbehold i UI. Oppdater tallene og datoen ved nye satser.
 */
export const BILKOSTNADER = {
  sistOppdatert: "2026-07-12",

  /** Omregistreringsavgift ved eierskifte, veiledende etter bilens alder (kr, engangs). */
  omregistrering: {
    nyereEnn4Aar: 6500,
    fire_til_12Aar: 4000,
    eldreEnn12Aar: 1700,
    elbil: 0,
  },

  /** Trafikkforsikringsavgift (tidl. årsavgift), veiledende per år. */
  trafikkforsikringsavgiftPerAar: 3300,
  trafikkforsikringsavgiftElbilPerAar: 3300,

  /** Typisk helforsikring per år - varierer mye med alder/bosted/bonus. */
  forsikringPerAar: 12000,

  /** Drivstoff/strøm per år ved ca. 12 000 km kjøring. */
  drivstoffPerAar: { bensin: 16000, diesel: 14000, elbil: 5000, hybrid: 11000 },

  /** Service, dekk og vedlikehold, veiledende per år. */
  vedlikeholdPerAar: 10000,

  /** Typisk verdifall per år som andel av kjøpesum (brukes kun som opplysning). */
  verdifallProsentPerAar: 10,
} as const;

export type Drivstoff = keyof typeof BILKOSTNADER.drivstoffPerAar;

/** Veiledende årlige eierkostnader (utenom verdifall) for en bil. */
export function aarligeEierkostnader(opts: {
  drivstoff: Drivstoff;
}): { post: string; belopPerAar: number }[] {
  const b = BILKOSTNADER;
  return [
    { post: "Trafikkforsikringsavgift", belopPerAar: b.trafikkforsikringsavgiftPerAar },
    { post: "Forsikring (typisk helforsikring)", belopPerAar: b.forsikringPerAar },
    { post: "Drivstoff/strøm (ca. 12 000 km)", belopPerAar: b.drivstoffPerAar[opts.drivstoff] },
    { post: "Service, dekk og vedlikehold", belopPerAar: b.vedlikeholdPerAar },
  ];
}

export function omregistreringsavgift(aarsmodell: number | null, erElbil: boolean): number {
  if (erElbil) return BILKOSTNADER.omregistrering.elbil;
  if (aarsmodell == null) return BILKOSTNADER.omregistrering.fire_til_12Aar;
  const alder = new Date().getFullYear() - aarsmodell;
  if (alder < 4) return BILKOSTNADER.omregistrering.nyereEnn4Aar;
  if (alder <= 12) return BILKOSTNADER.omregistrering.fire_til_12Aar;
  return BILKOSTNADER.omregistrering.eldreEnn12Aar;
}
