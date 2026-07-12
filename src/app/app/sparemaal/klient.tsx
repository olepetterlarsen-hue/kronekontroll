"use client";

import { useState, useTransition } from "react";
import { Felt, Knapp, Kort, inputKlasse } from "@/components/ui";
import { datoKort, kr } from "@/lib/format";
import { oppdaterSpart, opprettMaal, slettMaal } from "./actions";

interface Maal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
}

export function MaalKort({ maal, anbefaling }: { maal: Maal; anbefaling?: string }) {
  const [redigerer, setRedigerer] = useState(false);
  const [pending, startTransition] = useTransition();
  const pct =
    maal.target_amount > 0
      ? Math.min(100, Math.round((maal.saved_amount / maal.target_amount) * 100))
      : 0;

  return (
    <Kort>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{maal.name}</h2>
          <p className="mt-0.5 text-sm text-demp">
            {kr(maal.saved_amount)} av {kr(maal.target_amount)}
            {maal.target_date ? ` · innen ${datoKort(maal.target_date)}` : ""}
          </p>
        </div>
        <button
          onClick={() => startTransition(() => slettMaal(maal.id))}
          disabled={pending}
          className="text-xs text-demp hover:text-negativ"
          aria-label={`Slett målet ${maal.name}`}
        >
          Slett
        </button>
      </div>

      <div
        className="mt-4 h-3 rounded-full bg-flate-demp"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${maal.name}: ${pct} prosent`}
      >
        <div
          className="h-3 rounded-full bg-positiv transition-all"
          style={{ width: `${Math.max(3, pct)}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs font-semibold text-demp">{pct} %</p>

      {anbefaling ? (
        <p className="mt-2 rounded-xl bg-primar-lys px-3.5 py-2.5 text-xs leading-relaxed text-primar-mork">
          {anbefaling}
        </p>
      ) : null}

      {redigerer ? (
        <form
          className="mt-3 flex items-end gap-3"
          action={(fd) =>
            startTransition(async () => {
              await oppdaterSpart(fd);
              setRedigerer(false);
            })
          }
        >
          <input type="hidden" name="id" value={maal.id} />
          <div className="flex-1">
            <label htmlFor={`spart-${maal.id}`} className="text-xs font-semibold text-demp">
              Spart så langt (kr)
            </label>
            <input
              id={`spart-${maal.id}`}
              name="saved_amount"
              type="number"
              min="0"
              step="1"
              defaultValue={maal.saved_amount}
              className={`${inputKlasse} mt-1`}
            />
          </div>
          <Knapp type="submit" disabled={pending}>Lagre</Knapp>
        </form>
      ) : (
        <Knapp variant="sekundar" className="mt-3" onClick={() => setRedigerer(true)}>
          Oppdater beløp
        </Knapp>
      )}
    </Kort>
  );
}

export function NyttMaalSkjema() {
  const [aapen, setAapen] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!aapen) {
    return <Knapp onClick={() => setAapen(true)}>+ Nytt sparemål</Knapp>;
  }

  return (
    <Kort>
      <h3 className="font-semibold">Nytt sparemål</h3>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-3"
        action={(fd) =>
          startTransition(async () => {
            const res = await opprettMaal(fd);
            if (res.feil) setFeil(res.feil);
            else {
              setFeil(null);
              setAapen(false);
            }
          })
        }
      >
        <Felt label="Hva sparer du til?" id="name">
          <input id="name" name="name" className={inputKlasse} placeholder="F.eks. Buffer" required />
        </Felt>
        <Felt label="Beløp (kr)" id="target_amount">
          <input id="target_amount" name="target_amount" type="number" min="1" step="1" className={inputKlasse} required />
        </Felt>
        <Felt label="Innen (valgfritt)" id="target_date">
          <input id="target_date" name="target_date" type="date" className={inputKlasse} />
        </Felt>
        <div className="flex gap-3 sm:col-span-3">
          <Knapp type="submit" disabled={pending}>{pending ? "Lagrer…" : "Opprett mål"}</Knapp>
          <Knapp type="button" variant="sekundar" onClick={() => setAapen(false)}>Avbryt</Knapp>
        </div>
      </form>
      {feil ? <p role="alert" className="mt-3 text-sm text-negativ">{feil}</p> : null}
    </Kort>
  );
}
