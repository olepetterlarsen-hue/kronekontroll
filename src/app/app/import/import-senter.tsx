"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Etikett, Knapp, Kort, inputKlasse } from "@/components/ui";
import { kr } from "@/lib/format";
import { KATEGORI_NAVN, type Kategori } from "@/lib/kategorier";
import type { EpostParsed, InkassoParsed, Kontoutskrift, LaanParsed, LonnsslippParsed, DokumentType } from "@/lib/schemas";

const TYPER: { id: DokumentType; navn: string; beskrivelse: string }[] = [
  { id: "kontoutskrift", navn: "Kontoutskrift", beskrivelse: "PDF eller CSV fra banken" },
  { id: "inkasso", navn: "Inkasso eller purring", beskrivelse: "Brev eller varsel du har fått" },
  { id: "laan", navn: "Låneavtale", beskrivelse: "Lånedokumenter og avtaler" },
  { id: "epost", navn: "E-post", beskrivelse: "Lim inn eller last opp .eml" },
  { id: "lonnsslipp", navn: "Lønnsslipp", beskrivelse: "PDF fra arbeidsgiver" },
];

type Fase =
  | { steg: "velg" }
  | { steg: "laster" }
  | { steg: "bekreft"; documentId: string; docType: DokumentType; parsed: unknown }
  | { steg: "ferdig"; docType: DokumentType };

export function ImportSenter() {
  const router = useRouter();
  const [docType, setDocType] = useState<DokumentType>("kontoutskrift");
  const [fase, setFase] = useState<Fase>({ steg: "velg" });
  const [feil, setFeil] = useState<string | null>(null);
  const [tekst, setTekst] = useState("");
  const [drar, setDrar] = useState(false);
  const filInput = useRef<HTMLInputElement>(null);

  async function sendInn(fd: FormData) {
    setFeil(null);
    setFase({ steg: "laster" });
    fd.set("docType", docType);
    try {
      const res = await fetch("/api/import/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setFeil(data.error ?? "Noe gikk galt");
        setFase({ steg: "velg" });
        return;
      }
      setFase({ steg: "bekreft", documentId: data.documentId, docType: data.docType, parsed: data.parsed });
    } catch {
      setFeil("Mistet forbindelsen. Prøv igjen.");
      setFase({ steg: "velg" });
    }
  }

  async function haandterFil(fil: File | undefined | null) {
    if (!fil) return;
    const fd = new FormData();
    fd.set("fil", fil);
    await sendInn(fd);
  }

  async function bekreft(documentId: string) {
    setFase({ steg: "laster" });
    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFeil(data.error ?? "Kunne ikke lagre");
        setFase({ steg: "velg" });
        return;
      }
      setFase({ steg: "ferdig", docType });
      router.refresh();
    } catch {
      setFeil("Mistet forbindelsen. Prøv igjen.");
      setFase({ steg: "velg" });
    }
  }

  if (fase.steg === "laster") {
    return (
      <Kort className="py-16 text-center"><div role="status">
        <div
          aria-hidden
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primar-lys border-t-primar"
        />
        <p className="mt-4 font-semibold">Leser dokumentet …</p>
        <p className="mt-1 text-sm text-demp">Dette tar vanligvis 15-60 sekunder.</p></div>
      </Kort>
    );
  }

  if (fase.steg === "ferdig") {
    return (
      <Kort className="py-12 text-center">
        <p className="text-4xl" aria-hidden>✓</p>
        <h2 className="mt-3 text-xl font-semibold">Lagret!</h2>
        <p className="mt-2 text-sm text-demp">
          {fase.docType === "kontoutskrift"
            ? "Transaksjonene er på plass. Se oversikten for kategorier, abonnementer og trender."
            : fase.docType === "inkasso"
              ? "Kravet ligger nå under Gjeld og frister, med kontrollresultat og oppgave for fristen."
              : fase.docType === "laan"
                ? "Lånet ligger under Gjeld og frister, og renteradaren følger med på renten."
                : fase.docType === "lonnsslipp"
                  ? "Inntekten er registrert og brukes i Kjøpsplanleggeren og oversikten."
                  : "Eventuelle oppgaver fra e-posten ligger under Gjeld og frister."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Knapp onClick={() => { setTekst(""); setFase({ steg: "velg" }); }}>Importer flere</Knapp>
        </div>
      </Kort>
    );
  }

  if (fase.steg === "bekreft") {
    return (
      <Kort>
        <h2 className="text-lg font-semibold">Ser dette riktig ut?</h2>
        <p className="mt-1 text-sm text-demp">
          Kontroller mot originalen. Ingenting lagres i oversikten før du bekrefter.
        </p>
        <div className="mt-5">
          <Forhaandsvisning docType={fase.docType} parsed={fase.parsed} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Knapp onClick={() => bekreft(fase.documentId)}>Ja, lagre</Knapp>
          <Knapp variant="sekundar" onClick={() => setFase({ steg: "velg" })}>
            Forkast
          </Knapp>
        </div>
      </Kort>
    );
  }

  return (
    <div className="space-y-5">
      {/* Typevelger */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TYPER.map((t) => (
          <button
            key={t.id}
            onClick={() => setDocType(t.id)}
            aria-pressed={docType === t.id}
            className={`rounded-kort border p-4 text-left transition-colors ${
              docType === t.id
                ? "border-primar bg-primar-lys"
                : "border-linje bg-flate hover:border-primar/50"
            }`}
          >
            <p className="text-sm font-semibold">{t.navn}</p>
            <p className="mt-0.5 text-xs text-demp">{t.beskrivelse}</p>
          </button>
        ))}
      </div>

      {/* Slippsone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrar(true); }}
        onDragLeave={() => setDrar(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrar(false);
          void haandterFil(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-kort border-2 border-dashed p-10 text-center transition-colors ${
          drar ? "border-primar bg-primar-lys" : "border-linje bg-flate"
        }`}
      >
        <p className="font-semibold">Slipp filen her</p>
        <p className="mt-1 text-sm text-demp">PDF, CSV, tekst eller .eml · maks 15 MB</p>
        <Knapp variant="sekundar" className="mt-4" onClick={() => filInput.current?.click()}>
          Velg fil
        </Knapp>
        <input
          ref={filInput}
          type="file"
          accept=".pdf,.csv,.txt,.eml,application/pdf,text/csv,text/plain"
          className="sr-only"
          onChange={(e) => void haandterFil(e.target.files?.[0])}
        />
      </div>

      {/* Lim inn tekst (mest aktuelt for e-post) */}
      {docType === "epost" ? (
        <Kort>
          <label htmlFor="tekst" className="text-sm font-semibold">
            … eller lim inn e-posten her
          </label>
          <textarea
            id="tekst"
            rows={7}
            className={`${inputKlasse} mt-2 font-mono text-xs`}
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="Lim inn hele e-posten, gjerne med avsender og emne."
          />
          <Knapp
            className="mt-3"
            disabled={tekst.trim().length < 20}
            onClick={() => {
              const fd = new FormData();
              fd.set("tekst", tekst);
              void sendInn(fd);
            }}
          >
            Tolk e-posten
          </Knapp>
        </Kort>
      ) : null}

      {feil ? (
        <p role="alert" className="rounded-xl bg-negativ-lys px-4 py-3 text-sm text-negativ">
          {feil}
        </p>
      ) : null}
    </div>
  );
}

function Forhaandsvisning({ docType, parsed }: { docType: DokumentType; parsed: unknown }) {
  if (docType === "kontoutskrift") {
    const data = parsed as Kontoutskrift;
    const sum = data.transaksjoner.reduce((s, t) => (t.belop < 0 ? s + Math.abs(t.belop) : s), 0);
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          <Etikett tone="primar">{data.transaksjoner.length} transaksjoner</Etikett>
          {data.bank ? <Etikett>{data.bank}</Etikett> : null}
          <Etikett tone="varsel">{kr(sum)} i utgifter</Etikett>
        </div>
        <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-linje">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-flate-demp text-left text-xs uppercase tracking-wide text-demp">
              <tr>
                <th className="px-3 py-2 font-semibold">Dato</th>
                <th className="px-3 py-2 font-semibold">Beskrivelse</th>
                <th className="px-3 py-2 font-semibold">Kategori</th>
                <th className="px-3 py-2 text-right font-semibold">Beløp</th>
              </tr>
            </thead>
            <tbody>
              {data.transaksjoner.map((t, i) => (
                <tr key={i} className="border-t border-linje">
                  <td className="whitespace-nowrap px-3 py-1.5 text-demp">{t.dato}</td>
                  <td className="max-w-48 truncate px-3 py-1.5">{t.beskrivelse}</td>
                  <td className="px-3 py-1.5 text-demp">
                    {KATEGORI_NAVN[t.kategori as Kategori] ?? t.kategori}
                    {t.erGjentakende ? " ↻" : ""}
                  </td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${t.belop < 0 ? "" : "text-positiv"}`}>
                    {kr(t.belop)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (docType === "inkasso") {
    const data = parsed as InkassoParsed;
    return (
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Rad navn="Kreditor" verdi={data.kreditor} />
        <Rad navn="Inkassoselskap" verdi={data.inkassoselskap ?? "-"} />
        <Rad navn="Stadium" verdi={data.stadium} />
        <Rad navn="Betalingsfrist" verdi={data.betalingsfrist ?? "ikke oppgitt"} />
        <Rad navn="Hovedkrav" verdi={kr(data.hovedkrav)} />
        <Rad navn="Purregebyr" verdi={kr(data.purregebyr)} />
        <Rad navn="Salær" verdi={kr(data.salaer)} />
        <Rad navn="Renter" verdi={kr(data.renter)} />
        <Rad navn="Totalkrav" verdi={kr(data.totalkrav)} />
      </dl>
    );
  }

  if (docType === "laan") {
    const data = parsed as LaanParsed;
    return (
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Rad navn="Långiver" verdi={data.langiver} />
        <Rad navn="Type" verdi={data.laanetype} />
        <Rad navn="Hovedstol" verdi={kr(data.hovedstol)} />
        <Rad navn="Nominell rente" verdi={data.nominellRente != null ? `${data.nominellRente} %` : "-"} />
        <Rad navn="Effektiv rente" verdi={data.effektivRente != null ? `${data.effektivRente} %` : "-"} />
        <Rad navn="Terminbeløp" verdi={data.terminbelop != null ? kr(data.terminbelop) : "-"} />
      </dl>
    );
  }

  if (docType === "lonnsslipp") {
    const data = parsed as LonnsslippParsed;
    return (
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Rad navn="Arbeidsgiver" verdi={data.arbeidsgiver ?? "-"} />
        <Rad navn="Periode" verdi={data.periode ?? "-"} />
        <Rad navn="Bruttolønn" verdi={kr(data.bruttolonn)} />
        <Rad navn="Netto utbetalt" verdi={kr(data.nettoUtbetalt)} />
        <Rad navn="Skattetrekk" verdi={data.skattetrekk != null ? kr(data.skattetrekk) : "-"} />
      </dl>
    );
  }

  const data = parsed as EpostParsed;
  return (
    <div className="space-y-3 text-sm">
      <Rad navn="Fra" verdi={data.avsender ?? "-"} />
      <Rad navn="Emne" verdi={data.emne ?? "-"} />
      <Rad navn="Sammendrag" verdi={data.sammendrag} />
      {data.belop != null ? <Rad navn="Beløp" verdi={kr(data.belop)} /> : null}
      {data.frist ? <Rad navn="Frist" verdi={data.frist} /> : null}
      {data.foreslattOppgave ? (
        <p className="rounded-xl bg-primar-lys px-4 py-3">
          Foreslått oppgave: <strong>{data.foreslattOppgave}</strong>
        </p>
      ) : null}
    </div>
  );
}

function Rad({ navn, verdi }: { navn: string; verdi: string }) {
  return (
    <div className="rounded-xl bg-flate-demp/60 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-demp">{navn}</dt>
      <dd className="mt-0.5 font-medium">{verdi}</dd>
    </div>
  );
}
