"use client";

import { useMemo, useState, useTransition } from "react";
import { Etikett, Felt, Knapp, Kort, inputKlasse } from "@/components/ui";
import { datoKort, kr } from "@/lib/format";
import { fullforOppgave, leggTilGjeld, markerGjeldNedbetalt, markerInkassoLost } from "./actions";

// ---------- Oppgaveliste ----------

export function OppgaveListe({
  oppgaver,
}: {
  oppgaver: { id: string; title: string; description: string | null; due_date: string | null; source: string }[];
}) {
  const [pending, startTransition] = useTransition();
  return (
    <ul className="space-y-2">
      {oppgaver.map((o) => (
        <li
          key={o.id}
          className="flex items-start justify-between gap-4 rounded-kort border border-linje bg-flate p-4"
        >
          <div className="min-w-0">
            <p className="font-medium">{o.title}</p>
            {o.description ? <p className="mt-0.5 text-xs text-demp">{o.description}</p> : null}
            {o.due_date ? (
              <p className="mt-1">
                <Etikett tone={dagerIgjen(o.due_date) <= 3 ? "negativ" : "varsel"}>
                  Frist {datoKort(o.due_date)}
                </Etikett>
              </p>
            ) : null}
          </div>
          <Knapp
            variant="sekundar"
            disabled={pending}
            onClick={() => startTransition(() => fullforOppgave(o.id))}
          >
            Fullført
          </Knapp>
        </li>
      ))}
    </ul>
  );
}

export function InkassoHandlinger({ kravId }: { kravId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Knapp
      variant="sekundar"
      disabled={pending}
      onClick={() => startTransition(() => markerInkassoLost(kravId))}
    >
      Marker som løst
    </Knapp>
  );
}

// ---------- Nedbetalingsplan ----------

interface GjeldPost {
  id: string;
  creditor: string;
  principal: number;
  interestRate: number;
  monthlyPayment: number;
}

type Strategi = "snoball" | "skred";

function simuler(gjeld: GjeldPost[], budsjett: number, strategi: Strategi) {
  // Sorter: snøball = minste saldo først, skred = høyeste rente først
  const rekkefolge = [...gjeld].sort((a, b) =>
    strategi === "snoball" ? a.principal - b.principal : b.interestRate - a.interestRate,
  );
  const saldoer = new Map(rekkefolge.map((g) => [g.id, g.principal]));
  const totalSaldo = () => [...saldoer.values()].reduce((s, v) => s + Math.max(0, v), 0);
  let måneder = 0;
  let totaleRenter = 0;

  while (totalSaldo() > 0 && måneder < 600) {
    måneder++;
    const saldoFørMåneden = totalSaldo();
    // Renter påløper på alle poster
    for (const g of rekkefolge) {
      const saldo = saldoer.get(g.id)!;
      if (saldo <= 0) continue;
      const rente = (saldo * g.interestRate) / 100 / 12;
      totaleRenter += rente;
      saldoer.set(g.id, saldo + rente);
    }
    // Budsjettet betales i strategirekkefølge
    let igjen = budsjett;
    for (const g of rekkefolge) {
      if (igjen <= 0) break;
      const saldo = saldoer.get(g.id)!;
      if (saldo <= 0) continue;
      const betaling = Math.min(saldo, igjen);
      saldoer.set(g.id, saldo - betaling);
      igjen -= betaling;
    }
    // Hvis gjelden ikke sank denne måneden, dekker ikke budsjettet rentene -
    // da finnes ingen gjeldfri-dato, og vi sier tydelig fra i stedet.
    if (totalSaldo() >= saldoFørMåneden) {
      return { klarerIkke: true as const, måneder: 0, totaleRenter: 0 };
    }
  }

  if (totalSaldo() > 0) {
    // 600-månederstaket nådd uten å bli gjeldfri
    return { klarerIkke: true as const, måneder: 0, totaleRenter: 0 };
  }
  return { klarerIkke: false as const, måneder, totaleRenter: Math.round(totaleRenter) };
}

export function Nedbetalingsplan({ gjeld }: { gjeld: GjeldPost[] }) {
  const [strategi, setStrategi] = useState<Strategi>("skred");
  const standardBudsjett = Math.max(
    500,
    Math.round(gjeld.reduce((s, g) => s + (g.monthlyPayment || 0), 0)),
  );
  const [budsjett, setBudsjett] = useState(standardBudsjett);
  const [pending, startTransition] = useTransition();

  const resultat = useMemo(() => simuler(gjeld, budsjett, strategi), [gjeld, budsjett, strategi]);
  const alternativ = useMemo(
    () => simuler(gjeld, budsjett, strategi === "skred" ? "snoball" : "skred"),
    [gjeld, budsjett, strategi],
  );

  const gjeldfriDato = useMemo(() => {
    if (resultat.klarerIkke) return null;
    const d = new Date();
    d.setDate(1); // unngå månedsoverflyt (31. jan + 1 mnd ville blitt 3. mars)
    d.setMonth(d.getMonth() + resultat.måneder);
    return d;
  }, [resultat]);

  return (
    <Kort>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Nedbetalingsplan</h3>
        <div role="group" aria-label="Velg strategi" className="grid w-full grid-cols-2 rounded-full border border-linje p-0.5 sm:flex sm:w-auto">
          {(
            [
              ["skred", "Skred · dyrest først"],
              ["snoball", "Snøball · minst først"],
            ] as const
          ).map(([verdi, navn]) => (
            <button
              key={verdi}
              onClick={() => setStrategi(verdi)}
              aria-pressed={strategi === verdi}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                strategi === verdi ? "bg-primar text-white" : "text-demp hover:text-blekk"
              }`}
            >
              {navn}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="w-44">
          <label htmlFor="budsjett" className="text-xs font-semibold text-demp">
            Månedlig til nedbetaling
          </label>
          <input
            id="budsjett"
            type="number"
            min={100}
            step={100}
            className={`${inputKlasse} mt-1`}
            value={budsjett}
            onChange={(e) => setBudsjett(Number(e.target.value))}
          />
        </div>
        {resultat.klarerIkke ? (
          <p className="rounded-xl bg-negativ-lys px-4 py-2.5 text-sm text-negativ">
            Beløpet dekker ikke rentene. Øk beløpet, eller lag en e-post om frys av renter under
            E-postverkstedet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-demp">Gjeldfri</p>
              <p className="font-display text-2xl font-bold text-positiv">
                {gjeldfriDato?.toLocaleDateString("nb-NO", { month: "short", year: "numeric" })}
              </p>
              <p className="text-xs text-demp">{Math.floor(resultat.måneder / 12)} år og {resultat.måneder % 12} mnd</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-demp">Renter totalt</p>
              <p className="font-display text-2xl font-bold">{kr(resultat.totaleRenter)}</p>
              {!alternativ.klarerIkke && alternativ.totaleRenter !== resultat.totaleRenter ? (
                <p className="text-xs text-demp">
                  {resultat.totaleRenter < alternativ.totaleRenter
                    ? `${kr(alternativ.totaleRenter - resultat.totaleRenter)} billigere enn ${strategi === "skred" ? "snøball" : "skred"}`
                    : `${kr(resultat.totaleRenter - alternativ.totaleRenter)} dyrere enn ${strategi === "skred" ? "snøball" : "skred"}`}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Nedbetalingsrekkefølge */}
      <ol className="mt-5 space-y-2">
        {[...gjeld]
          .sort((a, b) =>
            strategi === "snoball" ? a.principal - b.principal : b.interestRate - a.interestRate,
          )
          .map((g, i) => (
            <li
              key={g.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-flate-demp/60 px-4 py-2.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primar text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 truncate font-medium">{g.creditor}</span>
              </span>
              <span className="flex items-center gap-4">
                <span className="tabular-nums text-demp">
                  {kr(g.principal)}{g.interestRate ? ` · ${g.interestRate} %` : ""}
                </span>
                <button
                  className="text-xs font-semibold text-positiv hover:underline disabled:opacity-50"
                  disabled={pending}
                  onClick={() => startTransition(() => markerGjeldNedbetalt(g.id))}
                >
                  Nedbetalt
                </button>
              </span>
            </li>
          ))}
      </ol>
    </Kort>
  );
}

// ---------- Manuelt gjeldsskjema ----------

export function GjeldSkjema() {
  const [aapen, setAapen] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!aapen) {
    return (
      <Knapp variant="sekundar" onClick={() => setAapen(true)}>
        + Legg til gjeld manuelt
      </Knapp>
    );
  }

  return (
    <Kort>
      <h3 className="font-semibold">Legg til gjeld</h3>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        action={(fd) =>
          startTransition(async () => {
            const res = await leggTilGjeld(fd);
            if (res.feil) setFeil(res.feil);
            else {
              setFeil(null);
              setAapen(false);
            }
          })
        }
      >
        <Felt label="Kreditor / bank" id="creditor">
          <input id="creditor" name="creditor" className={inputKlasse} required />
        </Felt>
        <Felt label="Type" id="debt_type">
          <select id="debt_type" name="debt_type" className={inputKlasse} defaultValue="forbrukslaan">
            <option value="forbrukslaan">Forbrukslån</option>
            <option value="kredittkort">Kredittkort</option>
            <option value="boliglaan">Boliglån</option>
            <option value="billaan">Billån</option>
            <option value="inkasso">Inkassogjeld</option>
            <option value="annet">Annet</option>
          </select>
        </Felt>
        <Felt label="Gjenstående beløp (kr)" id="principal">
          <input id="principal" name="principal" type="number" min="1" step="1" className={inputKlasse} required />
        </Felt>
        <Felt label="Rente (% per år)" id="interest_rate">
          <input id="interest_rate" name="interest_rate" type="number" min="0" max="100" step="0.1" className={inputKlasse} />
        </Felt>
        <Felt label="Månedlig betaling (kr)" id="monthly_payment">
          <input id="monthly_payment" name="monthly_payment" type="number" min="0" step="1" className={inputKlasse} />
        </Felt>
        <div className="flex items-end gap-3">
          <Knapp type="submit" disabled={pending}>
            {pending ? "Lagrer…" : "Lagre"}
          </Knapp>
          <Knapp type="button" variant="sekundar" onClick={() => setAapen(false)}>
            Avbryt
          </Knapp>
        </div>
      </form>
      {feil ? <p role="alert" className="mt-3 text-sm text-negativ">{feil}</p> : null}
    </Kort>
  );
}

function dagerIgjen(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
