import { aarligeEierkostnader, omregistreringsavgift, type Drivstoff } from "@/lib/config/bilkostnader";

/**
 * Kjøpsplanleggerens beregningsmotor. Ren, deterministisk funksjon -
 * ingen AI, bare harde tall fra brukerens egen økonomi.
 */

export interface KjopInput {
  pris: number;
  alleredeSpart: number;
  sparebelopPerMnd: number;
  /** Netto månedsinntekt fra nyeste lønnsslipp, null hvis ikke lastet opp. */
  nettoInntekt: number | null;
  /** Sum faste månedlige utgifter (gjentakende trekk fra kontoutskrift). */
  fasteUtgifter: number;
  /** Sum månedlige gjeldsbetalinger. */
  gjeldPerMnd: number;
  /** Total gjeld (for gjeldsgrad-sjekk). */
  totalGjeld: number;
  erBil: boolean;
  bil?: { aarsmodell: number | null; drivstoff: Drivstoff };
}

export interface Faktum {
  tittel: string;
  verdi: string;
  status: "ok" | "obs" | "mangler";
  forklaring: string;
}

export interface KjopResultat {
  manederTilMaal: number | null;
  kjopsklarDato: Date | null;
  fakta: Faktum[];
  bilkostnader: { post: string; belopPerAar: number }[] | null;
  bilKostnadPerMnd: number | null;
}

const nok = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

export function beregnKjopsplan(input: KjopInput): KjopResultat {
  const fakta: Faktum[] = [];
  const gjenstaar = Math.max(0, input.pris - input.alleredeSpart);

  // 1. Sparetid
  let manederTilMaal: number | null = null;
  let kjopsklarDato: Date | null = null;
  if (gjenstaar === 0) {
    manederTilMaal = 0;
    kjopsklarDato = new Date();
    fakta.push({
      tittel: "Sparetid",
      verdi: "Beløpet er på plass",
      status: "ok",
      forklaring: "Du har allerede spart hele kjøpesummen.",
    });
  } else if (input.sparebelopPerMnd > 0) {
    manederTilMaal = Math.ceil(gjenstaar / input.sparebelopPerMnd);
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + manederTilMaal);
    kjopsklarDato = d;
    fakta.push({
      tittel: "Sparetid",
      verdi: `${manederTilMaal} måneder`,
      status: manederTilMaal <= 24 ? "ok" : "obs",
      forklaring: `${nok(gjenstaar)} gjenstår med ${nok(input.sparebelopPerMnd)}/mnd. Klar ${d.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}.`,
    });
  } else {
    fakta.push({
      tittel: "Sparetid",
      verdi: "Sett et sparebeløp",
      status: "mangler",
      forklaring: "Uten månedlig sparebeløp kan vi ikke beregne når du er klar.",
    });
  }

  // 2. Er sparebeløpet realistisk? (krever lønnsslipp)
  if (input.nettoInntekt != null) {
    const handlingsrom = input.nettoInntekt - input.fasteUtgifter - input.gjeldPerMnd;
    const realistisk = input.sparebelopPerMnd <= handlingsrom;
    fakta.push({
      tittel: "Er sparebeløpet realistisk?",
      verdi: `${nok(Math.max(0, handlingsrom))} i månedlig handlingsrom`,
      status: realistisk ? "ok" : "obs",
      forklaring: realistisk
        ? `Netto inntekt ${nok(input.nettoInntekt)} minus faste utgifter ${nok(input.fasteUtgifter)} og gjeldsbetaling ${nok(input.gjeldPerMnd)} gir rom for sparebeløpet.`
        : `Sparebeløpet er høyere enn handlingsrommet (inntekt minus faste utgifter og gjeld). Juster ned, eller kutt faste utgifter først.`,
    });
  } else {
    fakta.push({
      tittel: "Er sparebeløpet realistisk?",
      verdi: "Last opp lønnsslipp",
      status: "mangler",
      forklaring: "Med en lønnsslipp kan vi sjekke sparebeløpet mot faktisk inntekt.",
    });
  }

  // 3. Gjeldssituasjonen
  if (input.totalGjeld > 0 && input.nettoInntekt != null) {
    const aarsinntektNetto = input.nettoInntekt * 12;
    const hoyGjeld = input.totalGjeld > aarsinntektNetto * 2;
    fakta.push({
      tittel: "Gjeldssituasjonen",
      verdi: nok(input.totalGjeld),
      status: hoyGjeld ? "obs" : "ok",
      forklaring: hoyGjeld
        ? "Gjelden er høy målt mot inntekten. Vurder om nedbetaling bør gå foran kjøpet - se nedbetalingsplanen."
        : "Gjelden ser håndterbar ut målt mot inntekten.",
    });
  } else if (input.totalGjeld === 0) {
    fakta.push({
      tittel: "Gjeldssituasjonen",
      verdi: "Ingen registrert gjeld",
      status: "ok",
      forklaring: "Ingen gjeld registrert i Kronekontroll.",
    });
  }

  // 4. Bilens eierkostnader
  let bilkostnader: KjopResultat["bilkostnader"] = null;
  let bilKostnadPerMnd: number | null = null;
  if (input.erBil) {
    const drivstoff = input.bil?.drivstoff ?? "bensin";
    bilkostnader = aarligeEierkostnader({ drivstoff });
    const omreg = omregistreringsavgift(input.bil?.aarsmodell ?? null, drivstoff === "elbil");
    const perAar = bilkostnader.reduce((s, k) => s + k.belopPerAar, 0);
    bilKostnadPerMnd = Math.round(perAar / 12);
    fakta.push({
      tittel: "Å eie bilen koster",
      verdi: `ca. ${nok(bilKostnadPerMnd)}/mnd`,
      status:
        input.nettoInntekt != null &&
        input.nettoInntekt - input.fasteUtgifter - input.gjeldPerMnd - input.sparebelopPerMnd < bilKostnadPerMnd
          ? "obs"
          : "ok",
      forklaring: `Veiledende årskostnad ${nok(perAar)} (avgift, forsikring, drivstoff, vedlikehold) + engangs omregistrering ca. ${nok(omreg)}. Verdifall kommer i tillegg.`,
    });
  }

  return { manederTilMaal, kjopsklarDato, fakta, bilkostnader, bilKostnadPerMnd };
}
