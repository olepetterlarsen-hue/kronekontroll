"use client";

import { useMemo, useState, useTransition } from "react";
import { Etikett, Felt, Knapp, Kort, inputKlasse } from "@/components/ui";
import { kr } from "@/lib/format";
import { beregnKjopsplan, type Faktum } from "@/lib/kjop";
import type { Drivstoff } from "@/lib/config/bilkostnader";
import { lagreKjopsplan, slettKjopsplan } from "./actions";

interface Grunnlag {
  nettoInntekt: number | null;
  inntektKilde: string | null;
  fasteUtgifter: number;
  gjeldPerMnd: number;
  totalGjeld: number;
}

interface Plan {
  id: string;
  title: string;
  price: number;
  monthly_saving: number;
  already_saved: number;
  is_vehicle: boolean;
  finn_url: string | null;
  vehicle_info: { aarsmodell: number | null; km: number | null; drivstoff: string } | null;
}

const DRIVSTOFF: { id: Drivstoff; navn: string }[] = [
  { id: "bensin", navn: "Bensin" },
  { id: "diesel", navn: "Diesel" },
  { id: "elbil", navn: "Elbil" },
  { id: "hybrid", navn: "Hybrid" },
];

export function KjopPlanlegger({
  grunnlag,
  eksisterende,
}: {
  grunnlag: Grunnlag;
  eksisterende: Plan[];
}) {
  const [tittel, setTittel] = useState("");
  const [pris, setPris] = useState<number>(0);
  const [spart, setSpart] = useState<number>(0);
  const [sparebelop, setSparebelop] = useState<number>(2000);
  const [erBil, setErBil] = useState(false);
  const [drivstoff, setDrivstoff] = useState<Drivstoff>("bensin");
  const [aarsmodell, setAarsmodell] = useState<string>("");
  const [finnUrl, setFinnUrl] = useState("");
  const [henter, setHenter] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, startTransition] = useTransition();

  async function hentAnnonse() {
    setHenter(true);
    setMelding(null);
    try {
      const res = await fetch("/api/kjop/annonse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finnUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMelding(data.error ?? "Klarte ikke å hente annonsen.");
      } else {
        if (data.tittel) setTittel(String(data.tittel).slice(0, 120));
        if (data.pris) setPris(data.pris);
        if (data.erBil) {
          setErBil(true);
          if (data.bilinfo?.aarsmodell) setAarsmodell(String(data.bilinfo.aarsmodell));
        }
        setMelding("Annonsen er hentet - kontroller tallene under.");
      }
    } catch {
      setMelding("Klarte ikke å hente annonsen. Fyll inn manuelt.");
    }
    setHenter(false);
  }

  const resultat = useMemo(() => {
    if (pris <= 0) return null;
    return beregnKjopsplan({
      pris,
      alleredeSpart: spart,
      sparebelopPerMnd: sparebelop,
      nettoInntekt: grunnlag.nettoInntekt,
      fasteUtgifter: grunnlag.fasteUtgifter,
      gjeldPerMnd: grunnlag.gjeldPerMnd,
      totalGjeld: grunnlag.totalGjeld,
      erBil,
      bil: erBil ? { aarsmodell: aarsmodell ? Number(aarsmodell) : null, drivstoff } : undefined,
    });
  }, [pris, spart, sparebelop, erBil, drivstoff, aarsmodell, grunnlag]);

  function lagre() {
    startTransition(async () => {
      const res = await lagreKjopsplan({
        title: tittel || "Uten navn",
        price: pris,
        monthly_saving: sparebelop,
        already_saved: spart,
        is_vehicle: erBil,
        finn_url: finnUrl.trim() ? finnUrl.trim() : null,
        vehicle_info: erBil
          ? { aarsmodell: aarsmodell ? Number(aarsmodell) : null, km: null, drivstoff }
          : null,
      });
      if (res.feil) setMelding(res.feil);
      else {
        setLagret(true);
        setTimeout(() => setLagret(false), 2500);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Venstre: skjema */}
      <div className="space-y-5">
        <Kort>
          <h2 className="font-semibold">Lim inn Finn-annonse (valgfritt)</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="finn-url" className="sr-only">
                Lenke til Finn-annonse
              </label>
              <input
                id="finn-url"
                type="url"
                className={inputKlasse}
                placeholder="https://www.finn.no/..."
                value={finnUrl}
                onChange={(e) => setFinnUrl(e.target.value)}
              />
            </div>
            <Knapp variant="sekundar" onClick={hentAnnonse} disabled={henter || !finnUrl.includes("finn.no")}>
              {henter ? "Henter…" : "Hent annonsen"}
            </Knapp>
          </div>
          {melding ? <p className="mt-2 text-sm text-demp">{melding}</p> : null}
        </Kort>

        <Kort>
          <h2 className="font-semibold">Hva vil du kjøpe?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Felt label="Tittel" id="tittel">
                <input
                  id="tittel"
                  className={inputKlasse}
                  value={tittel}
                  onChange={(e) => setTittel(e.target.value)}
                  placeholder="F.eks. Toyota RAV4 2019 eller Ny sofa"
                />
              </Felt>
            </div>
            <Felt label="Pris (kr)" id="pris">
              <input
                id="pris"
                type="number"
                min="0"
                step="1000"
                className={inputKlasse}
                value={pris || ""}
                onChange={(e) => setPris(Number(e.target.value))}
              />
            </Felt>
            <Felt label="Allerede spart (kr)" id="spart">
              <input
                id="spart"
                type="number"
                min="0"
                step="1000"
                className={inputKlasse}
                value={spart || ""}
                onChange={(e) => setSpart(Number(e.target.value))}
              />
            </Felt>
            <Felt label="Ønsket sparebeløp per måned (kr)" id="sparebelop">
              <input
                id="sparebelop"
                type="number"
                min="0"
                step="500"
                className={inputKlasse}
                value={sparebelop || ""}
                onChange={(e) => setSparebelop(Number(e.target.value))}
              />
            </Felt>
            <div className="flex items-end pb-1.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={erBil}
                  onChange={(e) => setErBil(e.target.checked)}
                  className="h-4 w-4 accent-primar"
                />
                Dette er en bil
              </label>
            </div>
            {erBil ? (
              <>
                <Felt label="Årsmodell" id="aarsmodell">
                  <input
                    id="aarsmodell"
                    type="number"
                    min="1980"
                    max="2030"
                    className={inputKlasse}
                    value={aarsmodell}
                    onChange={(e) => setAarsmodell(e.target.value)}
                    placeholder="F.eks. 2019"
                  />
                </Felt>
                <Felt label="Drivstoff" id="drivstoff">
                  <select
                    id="drivstoff"
                    className={inputKlasse}
                    value={drivstoff}
                    onChange={(e) => setDrivstoff(e.target.value as Drivstoff)}
                  >
                    {DRIVSTOFF.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.navn}
                      </option>
                    ))}
                  </select>
                </Felt>
              </>
            ) : null}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Knapp onClick={lagre} disabled={pending || pris <= 0}>
              {lagret ? "Lagret ✓" : pending ? "Lagrer…" : "Lagre planen"}
            </Knapp>
          </div>
        </Kort>

        {/* Grunnlaget beregningen bruker */}
        <Kort>
          <h2 className="font-semibold">Grunnlaget fra økonomien din</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-demp">Netto månedsinntekt</dt>
              <dd className="font-medium tabular-nums">
                {grunnlag.nettoInntekt != null ? kr(grunnlag.nettoInntekt) : "mangler lønnsslipp"}
              </dd>
            </div>
            {grunnlag.inntektKilde ? (
              <p className="text-xs text-demp">Fra {grunnlag.inntektKilde}</p>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-demp">Faste månedlige trekk</dt>
              <dd className="font-medium tabular-nums">{kr(grunnlag.fasteUtgifter)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-demp">Gjeldsbetaling per måned</dt>
              <dd className="font-medium tabular-nums">{kr(grunnlag.gjeldPerMnd)}</dd>
            </div>
          </dl>
        </Kort>
      </div>

      {/* Høyre: harde fakta */}
      <div className="space-y-5" aria-live="polite">
        {resultat ? (
          <Kort>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold">{tittel || "Kjøpet"}</h2>
              <span className="font-display text-2xl font-bold text-primar-mork">{kr(pris)}</span>
            </div>
            {resultat.kjopsklarDato ? (
              <p className="mt-1 text-sm text-demp">
                Kjøpsklar{" "}
                <strong className="text-positiv">
                  {resultat.manederTilMaal === 0
                    ? "nå"
                    : resultat.kjopsklarDato.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
                </strong>{" "}
                med dagens plan.
              </p>
            ) : null}
            <ul className="mt-5 space-y-3">
              {resultat.fakta.map((f) => (
                <FaktumRad key={f.tittel} faktum={f} />
              ))}
            </ul>

            {resultat.bilkostnader ? (
              <div className="mt-5 rounded-xl bg-flate-demp/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-demp">
                  Bilens årlige eierkostnader (veiledende)
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {resultat.bilkostnader.map((k) => (
                    <li key={k.post} className="flex justify-between gap-3">
                      <span>{k.post}</span>
                      <span className="tabular-nums font-medium">{kr(k.belopPerAar)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Kort>
        ) : (
          <Kort className="flex min-h-48 items-center justify-center text-sm text-demp">
            Fyll inn pris, så regner vi ut faktaene her.
          </Kort>
        )}

        {eksisterende.length > 0 ? (
          <Kort>
            <h2 className="font-semibold">Lagrede planer</h2>
            <ul className="mt-3 space-y-2">
              {eksisterende.map((p) => (
                <LagretPlan key={p.id} plan={p} />
              ))}
            </ul>
          </Kort>
        ) : null}
      </div>
    </div>
  );
}

function FaktumRad({ faktum }: { faktum: Faktum }) {
  const tone = { ok: "positiv", obs: "varsel", mangler: "noytral" } as const;
  const merke = { ok: "På plass", obs: "Se på dette", mangler: "Mangler data" } as const;
  return (
    <li className="rounded-xl border border-linje p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{faktum.tittel}</span>
        <Etikett tone={tone[faktum.status]}>{merke[faktum.status]}</Etikett>
      </div>
      <p className="mt-1 text-sm font-medium text-primar-mork">{faktum.verdi}</p>
      <p className="mt-1 text-xs leading-relaxed text-demp">{faktum.forklaring}</p>
    </li>
  );
}

function LagretPlan({ plan }: { plan: Plan }) {
  const [pending, startTransition] = useTransition();
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-flate-demp/60 px-4 py-2.5 text-sm">
      <span className="min-w-0">
        <span className="font-medium">{plan.title}</span>{" "}
        <span className="text-demp">
          · {kr(plan.price)} · sparer {kr(plan.monthly_saving)}/mnd
          {plan.is_vehicle ? " · bil" : ""}
        </span>
        {plan.finn_url ? (
          <>
            {" "}
            <a
              href={plan.finn_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primar hover:underline"
            >
              Annonsen ↗
            </a>
          </>
        ) : null}
      </span>
      <button
        onClick={() => startTransition(() => slettKjopsplan(plan.id))}
        disabled={pending}
        className="text-xs font-semibold text-demp hover:text-negativ"
      >
        Slett
      </button>
    </li>
  );
}
