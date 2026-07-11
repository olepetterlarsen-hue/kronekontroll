import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { env } from "@/lib/env";
import {
  EpostSchema,
  InkassoSchema,
  KontoutskriftSchema,
  LaanSchema,
  UtkastSchema,
  type DokumentType,
  type MalType,
} from "@/lib/schemas";

/**
 * AI-laget. Personvernprinsipper:
 *  - Ett dokument fra én bruker per kall. Aldri data fra flere brukere i samme kontekst.
 *  - Prompt- og responsinnhold logges aldri.
 *  - Parseren instrueres til å maskere fødselsnummer; i tillegg kjøres
 *    maskFnr() på all tekst før den sendes videre eller lagres.
 * Anthropic API trener ikke på API-data. Databehandleravtale dokumenteres i personvernerklæringen.
 */

const MODEL = "claude-opus-4-8";

function client() {
  return new Anthropic({ apiKey: env.anthropicApiKey() });
}

/** Maskerer norske fødselsnummer (11 siffer, evt. med mellomrom etter 6) i fritekst. */
export function maskFnr(tekst: string): string {
  return tekst.replace(/\b(\d{6})\s?(\d{5})\b/g, "$1 *****");
}

const FELLES_INSTRUKS = `Du tolker et privatøkonomi-dokument for en norsk privatperson.
Viktig:
- Hvis dokumentet inneholder fødselsnummer (11 siffer), skal det ALDRI gjengis i output.
- Beløp oppgis i NOK som tall uten tusenskilletegn.
- Datoer som ISO-format (YYYY-MM-DD). Bruk null når noe ikke fremgår av dokumentet.
- Ikke gjett på tall som ikke står i dokumentet.`;

const PARSE_PROMPTS: Record<DokumentType, string> = {
  kontoutskrift: `${FELLES_INSTRUKS}
Dokumentet er en kontoutskrift fra en norsk bank. Trekk ut alle transaksjoner.
Kategoriser hver transaksjon i en av de tillatte kategoriene. Merk transaksjoner
som ser ut som faste, gjentakende trekk (strømming, trening, husleie, forsikring) med erGjentakende=true.`,
  inkasso: `${FELLES_INSTRUKS}
Dokumentet er et inkassobrev, inkassovarsel eller en purring. Trekk ut kreditor,
eventuelt inkassoselskap, beløpene (hovedkrav, purregebyr, salær, renter, totalkrav)
og betalingsfristen. Vurder hvilket stadium i inkassoløpet brevet representerer.`,
  laan: `${FELLES_INSTRUKS}
Dokumentet er en låneavtale eller lånedokumentasjon. Trekk ut långiver, lånetype,
hovedstol, nominell og effektiv rente og terminbeløp.`,
  epost: `${FELLES_INSTRUKS}
Dette er en e-post brukeren har mottatt. Oppsummer hva den gjelder på norsk,
og finn eventuelle beløp og frister. Foreslå en kort oppgave hvis brukeren bør foreta seg noe.`,
};

const PARSE_SCHEMAS = {
  kontoutskrift: KontoutskriftSchema,
  inkasso: InkassoSchema,
  laan: LaanSchema,
  epost: EpostSchema,
} as const;

export type ParsedDokument =
  | { docType: "kontoutskrift"; data: z.infer<typeof KontoutskriftSchema> }
  | { docType: "inkasso"; data: z.infer<typeof InkassoSchema> }
  | { docType: "laan"; data: z.infer<typeof LaanSchema> }
  | { docType: "epost"; data: z.infer<typeof EpostSchema> };

/**
 * Tolker ett dokument. `innhold` er enten en PDF (base64) eller ren tekst (CSV/e-post).
 */
export async function parseDokument(
  docType: DokumentType,
  innhold: { pdfBase64?: string; tekst?: string },
): Promise<ParsedDokument> {
  const schema = PARSE_SCHEMAS[docType];

  const userContent: Anthropic.ContentBlockParam[] = [];
  if (innhold.pdfBase64) {
    userContent.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: innhold.pdfBase64 },
    });
  }
  if (innhold.tekst) {
    userContent.push({ type: "text", text: maskFnr(innhold.tekst) });
  }
  userContent.push({ type: "text", text: "Tolk dokumentet over." });

  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: PARSE_PROMPTS[docType],
    messages: [{ role: "user", content: userContent }],
    output_config: { format: zodOutputFormat(schema) },
  });

  const data = response.parsed_output;
  if (!data) throw new Error("Kunne ikke tolke dokumentet. Prøv igjen eller kontakt oss.");
  return { docType, data } as ParsedDokument;
}

// ---------- E-postverkstedet ----------

const MAL_INSTRUKS: Record<MalType, string> = {
  betalingsplan:
    "en forespørsel til en kreditor om betalingsplan eller utsettelse. Vis betalingsvilje, foreslå en konkret og realistisk løsning, og be om skriftlig bekreftelse.",
  innsigelse_inkasso:
    "en saklig innsigelse mot et inkassokrav (feil beløp, ukjent krav eller gebyrer/salær som virker høyere enn satsene i inkassoforskriften). Be om spesifisert oppstilling av kravet og at innkrevingen stilles i bero til innsigelsen er behandlet.",
  rentenedsettelse:
    "en forespørsel til banken om lavere rente på et lån. Vis til kundeforholdet og til at bedre betingelser finnes hos konkurrenter (Finansportalen), og be om konkret ny sats.",
  oppsigelse_abonnement:
    "en oppsigelse av et abonnement. Tydelig, høflig og endelig: be om bekreftelse på oppsigelsen, sluttdato og at ingen flere trekk skjer.",
  frys_renter:
    "en forespørsel om midlertidig frys av renter og gebyrer på grunn av betalingsproblemer. Ærlig om situasjonen, konkret om hva som foreslås, og be om skriftlig svar.",
};

export async function genererUtkast(input: {
  malType: MalType;
  mottaker: string;
  detaljer: string;
  belop?: number;
  avsenderNavn?: string;
}): Promise<{ emne: string; broedtekst: string }> {
  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: `Du skriver e-postutkast for en norsk privatperson. Skriv ${MAL_INSTRUKS[input.malType]}
Tonen er høflig, saklig og myndig norsk bokmål. Ingen tankestrek (bruk komma eller vanlig bindestrek).
Brukeren sender e-posten selv, så ikke lov noe på vegne av andre, og ikke oppgi opplysninger
som ikke finnes i detaljene under. Undertegn med avsenders navn hvis oppgitt, ellers "[Ditt navn]".
Aldri inkluder fødselsnummer.`,
    messages: [
      {
        role: "user",
        content: `Mottaker: ${input.mottaker}
${input.belop ? `Beløp saken gjelder: ${input.belop} kr` : ""}
Detaljer fra brukeren: ${maskFnr(input.detaljer)}
Avsenders navn: ${input.avsenderNavn ?? "(ikke oppgitt)"}`,
      },
    ],
    output_config: { format: zodOutputFormat(UtkastSchema) },
  });

  const data = response.parsed_output;
  if (!data) throw new Error("Kunne ikke generere utkast. Prøv igjen.");
  return data;
}
