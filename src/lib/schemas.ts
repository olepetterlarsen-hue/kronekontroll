import { z } from "zod";
import { KATEGORIER } from "@/lib/kategorier";

/**
 * Zod-skjemaer for AI-tolkning av dokumenter (strukturert output fra Claude)
 * og for validering av API-input. AI-output valideres alltid mot disse -
 * aldri regex-parsing av modellsvar.
 */

// ---------- Kontoutskrift ----------

export const TransaksjonSchema = z.object({
  dato: z.string().describe("ISO-dato, YYYY-MM-DD"),
  beskrivelse: z.string(),
  belop: z.number().describe("Negativt for utgift, positivt for inntekt, i NOK"),
  kategori: z.enum(KATEGORIER),
  erGjentakende: z
    .boolean()
    .describe("true hvis dette ser ut som et fast, gjentakende trekk (abonnement, husleie osv.)"),
});

export const KontoutskriftSchema = z.object({
  bank: z.string().nullable(),
  periodeFra: z.string().nullable(),
  periodeTil: z.string().nullable(),
  transaksjoner: z.array(TransaksjonSchema),
});

export type Kontoutskrift = z.infer<typeof KontoutskriftSchema>;

// ---------- Inkassobrev / purring ----------

export const InkassoSchema = z.object({
  kreditor: z.string().describe("Hvem det opprinnelige kravet er fra"),
  inkassoselskap: z.string().nullable(),
  hovedkrav: z.number().describe("Opprinnelig kravbeløp i NOK"),
  purregebyr: z.number(),
  salaer: z.number().describe("Inkassosalær i NOK, 0 hvis ikke oppgitt"),
  renter: z.number(),
  totalkrav: z.number(),
  betalingsfrist: z.string().nullable().describe("ISO-dato eller null"),
  stadium: z.enum(["purring", "inkassovarsel", "betalingsoppfordring", "rettslig"]),
});

export type InkassoParsed = z.infer<typeof InkassoSchema>;

// ---------- Låneavtale ----------

export const LaanSchema = z.object({
  langiver: z.string(),
  laanetype: z.enum(["forbrukslaan", "kredittkort", "boliglaan", "billaan", "annet"]),
  hovedstol: z.number().describe("Gjenstående eller opprinnelig lånebeløp i NOK"),
  nominellRente: z.number().nullable().describe("Nominell årlig rente i prosent"),
  effektivRente: z.number().nullable(),
  terminbelop: z.number().nullable().describe("Månedlig terminbeløp i NOK"),
});

export type LaanParsed = z.infer<typeof LaanSchema>;

// ---------- E-post (limt inn eller lastet opp) ----------

export const EpostSchema = z.object({
  avsender: z.string().nullable(),
  emne: z.string().nullable(),
  sammendrag: z.string().describe("2-3 setninger på norsk om hva e-posten gjelder"),
  gjelderPenger: z.boolean(),
  belop: z.number().nullable(),
  frist: z.string().nullable().describe("ISO-dato hvis e-posten inneholder en frist"),
  foreslattOppgave: z
    .string()
    .nullable()
    .describe("Kort oppgavetittel hvis brukeren bør foreta seg noe, ellers null"),
});

export type EpostParsed = z.infer<typeof EpostSchema>;

// ---------- E-postutkast (verkstedet) ----------

export const UtkastSchema = z.object({
  emne: z.string(),
  broedtekst: z.string().describe("Hele e-posten på norsk, klar til å sendes"),
});

export const MALTYPER = [
  "betalingsplan",
  "innsigelse_inkasso",
  "rentenedsettelse",
  "oppsigelse_abonnement",
  "frys_renter",
] as const;

export type MalType = (typeof MALTYPER)[number];

// ---------- API-input ----------

export const GenererUtkastInput = z.object({
  malType: z.enum(MALTYPER),
  mottaker: z.string().min(1).max(200),
  detaljer: z.string().max(2000).describe("Fritekst fra brukeren om saken"),
  belop: z.number().optional(),
});

export const DokumentTypeSchema = z.enum(["kontoutskrift", "inkasso", "laan", "epost"]);
export type DokumentType = z.infer<typeof DokumentTypeSchema>;
