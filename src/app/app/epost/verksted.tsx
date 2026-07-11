"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Etikett, Felt, Knapp, Kort, inputKlasse } from "@/components/ui";
import { datoKort } from "@/lib/format";
import type { MalType } from "@/lib/schemas";

const MALER: { id: MalType; navn: string; hint: string }[] = [
  {
    id: "betalingsplan",
    navn: "Be om betalingsplan",
    hint: "Til kreditor eller inkassoselskap. Beskriv kravet og hva du realistisk kan betale per måned.",
  },
  {
    id: "innsigelse_inkasso",
    navn: "Bestrid inkassokrav",
    hint: "Beskriv kravet og hvorfor du mener det er feil (ukjent krav, feil beløp, høye gebyrer).",
  },
  {
    id: "rentenedsettelse",
    navn: "Forhandle ned renta",
    hint: "Til banken. Oppgi lånetype, dagens rente og gjerne hva konkurrenter tilbyr.",
  },
  {
    id: "oppsigelse_abonnement",
    navn: "Si opp abonnement",
    hint: "Hvilket abonnement, og eventuelt kundenummer eller e-posten kontoen er registrert på.",
  },
  {
    id: "frys_renter",
    navn: "Be om frys av renter",
    hint: "Beskriv betalingsproblemene kort og hva du foreslår (f.eks. frys i 3 måneder).",
  },
];

const MAL_NAVN = Object.fromEntries(MALER.map((m) => [m.id, m.navn]));

interface Tidligere {
  id: string;
  template_type: string;
  subject: string;
  body: string;
  created_at: string;
}

function Verksted({ tidligere }: { tidligere: Tidligere[] }) {
  const searchParams = useSearchParams();
  const forvalgt = searchParams.get("mal");
  const [malType, setMalType] = useState<MalType>(
    MALER.some((m) => m.id === forvalgt) ? (forvalgt as MalType) : "betalingsplan",
  );
  const [mottaker, setMottaker] = useState("");
  const [detaljer, setDetaljer] = useState("");
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ emne: string; broedtekst: string } | null>(null);
  const [kopiert, setKopiert] = useState(false);

  const aktivMal = MALER.find((m) => m.id === malType)!;

  async function generer() {
    setFeil(null);
    setLaster(true);
    setResultat(null);
    try {
      const res = await fetch("/api/epost/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ malType, mottaker, detaljer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeil(data.error ?? "Noe gikk galt");
      } else {
        setResultat({ emne: data.emne, broedtekst: data.broedtekst });
      }
    } catch {
      setFeil("Mistet forbindelsen. Prøv igjen.");
    }
    setLaster(false);
  }

  async function kopier() {
    if (!resultat) return;
    await navigator.clipboard.writeText(`Emne: ${resultat.emne}\n\n${resultat.broedtekst}`);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        {/* Malvelger */}
        <div className="grid gap-2">
          {MALER.map((m) => (
            <button
              key={m.id}
              onClick={() => setMalType(m.id)}
              aria-pressed={malType === m.id}
              className={`rounded-kort border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                malType === m.id
                  ? "border-primar bg-primar-lys text-primar-mork"
                  : "border-linje bg-flate hover:border-primar/50"
              }`}
            >
              {m.navn}
            </button>
          ))}
        </div>

        <Kort>
          <div className="space-y-4">
            <Felt label="Til hvem?" id="mottaker" hjelpetekst="Navn på selskapet eller kreditoren.">
              <input
                id="mottaker"
                className={inputKlasse}
                value={mottaker}
                onChange={(e) => setMottaker(e.target.value)}
                placeholder="F.eks. Inkassoselskapet AS"
              />
            </Felt>
            <Felt label="Beskriv saken" id="detaljer" hjelpetekst={aktivMal.hint}>
              <textarea
                id="detaljer"
                rows={5}
                className={inputKlasse}
                value={detaljer}
                onChange={(e) => setDetaljer(e.target.value)}
              />
            </Felt>
            {feil ? <p role="alert" className="text-sm text-negativ">{feil}</p> : null}
            <Knapp onClick={generer} disabled={laster || mottaker.trim().length === 0 || detaljer.trim().length < 10}>
              {laster ? "Skriver utkast…" : "Lag utkast"}
            </Knapp>
          </div>
        </Kort>
      </div>

      <div className="space-y-5">
        {resultat ? (
          <Kort>
            <div className="flex items-center justify-between">
              <Etikett tone="varsel">Utkast - les gjennom og send selv</Etikett>
            </div>
            <p className="mt-3 text-sm font-semibold">Emne: {resultat.emne}</p>
            <pre className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl bg-flate-demp/60 p-4 text-sm leading-relaxed">
              {resultat.broedtekst}
            </pre>
            <div className="mt-4 flex flex-wrap gap-3">
              <Knapp onClick={kopier}>{kopiert ? "Kopiert ✓" : "Kopier"}</Knapp>
              <a
                href={`mailto:?subject=${encodeURIComponent(resultat.emne)}&body=${encodeURIComponent(resultat.broedtekst)}`}
                className="inline-flex items-center justify-center rounded-full border border-linje bg-flate px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primar hover:text-primar"
              >
                Åpne i e-postklient
              </a>
            </div>
          </Kort>
        ) : (
          <Kort className="flex min-h-48 items-center justify-center text-sm text-demp">
            Utkastet dukker opp her.
          </Kort>
        )}

        {tidligere.length > 0 ? (
          <Kort>
            <h2 className="font-semibold">Tidligere utkast</h2>
            <ul className="mt-3 divide-y divide-linje">
              {tidligere.map((u) => (
                <li key={u.id} className="py-3">
                  <details>
                    <summary className="cursor-pointer text-sm">
                      <span className="font-medium">{u.subject}</span>{" "}
                      <span className="text-xs text-demp">
                        · {MAL_NAVN[u.template_type] ?? u.template_type} · {datoKort(u.created_at)}
                      </span>
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-flate-demp/60 p-3 text-xs leading-relaxed">
                      {u.body}
                    </pre>
                  </details>
                </li>
              ))}
            </ul>
          </Kort>
        ) : null}
      </div>
    </div>
  );
}

export function EpostVerksted({ tidligere }: { tidligere: Tidligere[] }) {
  return (
    <Suspense>
      <Verksted tidligere={tidligere} />
    </Suspense>
  );
}
