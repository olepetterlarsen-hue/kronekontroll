/**
 * Referanserenter for Renteradaren. Konfigurerbare veiledende nivåer -
 * oppdateres manuelt mot Finansportalen ved jevne mellomrom.
 * Vises alltid med forbehold i UI: "veiledende nivå, sjekk Finansportalen".
 */
export const REFERANSERENTER = {
  sistOppdatert: "2026-07-11",
  kilde: "Veiledende nivåer basert på Finansportalen",
  satser: {
    boliglaan: 5.4,
    billaan: 7.5,
    forbrukslaan: 12.0,
    kredittkort: 22.0,
    annet: 12.0,
  } as Record<string, number>,
} as const;

/** Årlig merkostnad hvis brukerens rente er over referansen. */
export function aarligMerkostnad(
  hovedstol: number,
  brukersRente: number,
  laanetype: string,
): { referanse: number; merkostnad: number } | null {
  const referanse = REFERANSERENTER.satser[laanetype];
  if (referanse === undefined || brukersRente <= referanse) return null;
  return {
    referanse,
    merkostnad: Math.round((hovedstol * (brukersRente - referanse)) / 100),
  };
}
