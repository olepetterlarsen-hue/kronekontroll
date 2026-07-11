"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Felt, Knapp, inputKlasse } from "@/components/ui";
import { oppdaterProfil, oppdaterVarsler } from "./actions";

export function ProfilSkjema({ navn }: { navn: string }) {
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  return (
    <form
      className="flex items-end gap-3"
      action={(fd) =>
        startTransition(async () => {
          await oppdaterProfil(fd);
          setLagret(true);
          setTimeout(() => setLagret(false), 2000);
        })
      }
    >
      <div className="flex-1">
        <Felt label="Navn" id="full_name">
          <input id="full_name" name="full_name" defaultValue={navn} className={inputKlasse} required />
        </Felt>
      </div>
      <Knapp type="submit" disabled={pending}>
        {lagret ? "Lagret ✓" : "Lagre"}
      </Knapp>
    </form>
  );
}

const VARSELVALG = [
  { navn: "task_reminders", tittel: "Fristvarsler", tekst: "7 dager og 1 dag før en frist." },
  { navn: "savings_milestones", tittel: "Sparemål-milepæler", tekst: "Når du passerer 50 % og når målet." },
  { navn: "weekly_summary", tittel: "Ukentlig oppsummering", tekst: "Kort status hver mandag morgen." },
] as const;

export function VarslerSkjema({ verdier }: { verdier: Record<string, boolean> }) {
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await oppdaterVarsler(fd);
          setLagret(true);
          setTimeout(() => setLagret(false), 2000);
        })
      }
      className="space-y-3"
    >
      {VARSELVALG.map((v) => (
        <label key={v.navn} className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-flate-demp/50">
          <input
            type="checkbox"
            name={v.navn}
            defaultChecked={verdier[v.navn]}
            className="mt-1 h-4 w-4 accent-[#0e5f58]"
          />
          <span>
            <span className="block text-sm font-medium">{v.tittel}</span>
            <span className="block text-xs text-demp">{v.tekst}</span>
          </span>
        </label>
      ))}
      <Knapp type="submit" variant="sekundar" disabled={pending}>
        {lagret ? "Lagret ✓" : "Lagre varslingsvalg"}
      </Knapp>
    </form>
  );
}

export function SlettKonto() {
  const router = useRouter();
  const [aapen, setAapen] = useState(false);
  const [tekst, setTekst] = useState("");
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function slett() {
    setLaster(true);
    setFeil(null);
    try {
      const res = await fetch("/api/gdpr/slett", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bekreftelse: tekst }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFeil(data.error ?? "Kunne ikke slette");
        setLaster(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setFeil("Mistet forbindelsen. Prøv igjen.");
      setLaster(false);
    }
  }

  if (!aapen) {
    return (
      <Knapp variant="fare" onClick={() => setAapen(true)}>
        Slett kontoen min
      </Knapp>
    );
  }

  return (
    <div className="w-full rounded-kort border border-negativ/30 bg-negativ-lys/50 p-5">
      <p className="text-sm font-semibold text-negativ">Dette kan ikke angres</p>
      <p className="mt-1 text-sm text-blekk/80">
        Alle dokumenter, transaksjoner, mål og profilen din slettes permanent, og abonnementet
        stoppes. Skriv <strong>SLETT KONTOEN MIN</strong> for å bekrefte.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          className={`${inputKlasse} max-w-60`}
          placeholder="SLETT KONTOEN MIN"
          aria-label="Bekreftelsestekst"
        />
        <Knapp variant="fare" disabled={laster || tekst !== "SLETT KONTOEN MIN"} onClick={slett}>
          {laster ? "Sletter…" : "Slett permanent"}
        </Knapp>
        <Knapp variant="sekundar" onClick={() => setAapen(false)}>
          Avbryt
        </Knapp>
      </div>
      {feil ? <p role="alert" className="mt-2 text-sm text-negativ">{feil}</p> : null}
    </div>
  );
}
