import Link from "next/link";
import { redirect } from "next/navigation";
import { Etikett, Kort, TomTilstand, KnappLenke } from "@/components/ui";
import { INKASSO_SATSER, type InkassoFlagg } from "@/lib/config/inkasso";
import { datoKort, kr } from "@/lib/format";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { GjeldSkjema, Nedbetalingsplan, OppgaveListe, InkassoHandlinger } from "./klient";

export const metadata = { title: "Gjeld og frister" };

const STADIER = ["purring", "inkassovarsel", "betalingsoppfordring", "rettslig"] as const;
const STADIE_NAVN: Record<string, string> = {
  purring: "Purring",
  inkassovarsel: "Inkassovarsel",
  betalingsoppfordring: "Betalingsoppfordring",
  rettslig: "Rettslig innkreving",
};

export default async function GjeldSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const [{ data: gjeld }, { data: inkasso }, { data: oppgaver }] = await Promise.all([
    supabase
      .from("debts")
      .select("id, creditor, debt_type, principal, interest_rate, monthly_payment")
      .eq("user_id", user.id)
      .eq("status", "aktiv")
      .order("principal", { ascending: false }),
    supabase
      .from("inkasso_claims")
      .select("id, creditor, collector, original_amount, purregebyr, salaer, renter, total_amount, deadline, stage, flags")
      .eq("user_id", user.id)
      .eq("resolved", false)
      .order("deadline", { ascending: true, nullsFirst: false }),
    supabase
      .from("tasks")
      .select("id, title, description, due_date, source")
      .eq("user_id", user.id)
      .eq("status", "aapen")
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  const totalGjeld = (gjeld ?? []).reduce((s, g) => s + g.principal, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Gjeld og frister</h1>
        <p className="mt-1 max-w-2xl text-sm text-demp">{site.disclaimer}</p>
      </div>

      {/* Inkassokrav - alltid øverst, det haster mest */}
      {(inkasso?.length ?? 0) > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Aktive inkassosaker</h2>
          {inkasso!.map((krav) => {
            const flagg = (krav.flags ?? []) as InkassoFlagg[];
            const stadieIndex = STADIER.indexOf(krav.stage as (typeof STADIER)[number]);
            return (
              <Kort key={krav.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{krav.creditor}</p>
                    <p className="text-xs text-demp">
                      {krav.collector ? `via ${krav.collector} · ` : ""}
                      totalkrav <strong className="text-blekk">{kr(krav.total_amount)}</strong>
                      {krav.deadline ? ` · frist ${datoKort(krav.deadline)}` : ""}
                    </p>
                  </div>
                  <Etikett tone={stadieIndex >= 2 ? "negativ" : "varsel"}>
                    {STADIE_NAVN[krav.stage]}
                  </Etikett>
                </div>

                {/* Tidslinje for inkassoløpet */}
                <ol className="mt-4 flex items-center gap-1" aria-label="Hvor saken er i inkassoløpet">
                  {STADIER.map((s, i) => (
                    <li key={s} className="flex flex-1 items-center gap-1">
                      <span
                        className={`h-1.5 w-full rounded-full ${i <= stadieIndex ? "bg-varsel" : "bg-flate-demp"}`}
                        title={STADIE_NAVN[s]}
                      />
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-demp">
                  Neste steg hvis kravet ikke håndteres:{" "}
                  {stadieIndex < 3
                    ? `${STADIE_NAVN[STADIER[stadieIndex + 1]]}. Etter betalingsoppfordring kan saken gi betalingsanmerkning - handle før det.`
                    : "Saken er til rettslig innkreving. Vurder gratis gjeldsrådgivning hos NAV."}
                </p>

                {/* Kontrollfunn */}
                {flagg.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {flagg.map((f) => (
                      <p key={f.kode} className="rounded-xl bg-negativ-lys px-4 py-2.5 text-sm text-negativ">
                        {f.tekst}
                      </p>
                    ))}
                    <p className="text-xs text-demp">
                      Kontrollen bruker satser per {INKASSO_SATSER.sistOppdatert} og er veiledende,
                      ikke en juridisk konklusjon.{" "}
                      <Link
                        href="/app/epost?mal=innsigelse_inkasso"
                        className="font-semibold text-primar hover:underline"
                      >
                        Lag innsigelses-e-post
                      </Link>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-demp">
                    Inkassokontrollen fant ingen avvik i gebyrer eller salær.
                  </p>
                )}

                <div className="mt-4">
                  <InkassoHandlinger kravId={krav.id} />
                </div>
              </Kort>
            );
          })}
        </section>
      ) : null}

      {/* Oppgaver */}
      <section>
        <h2 className="text-lg font-semibold">Oppgaver og frister</h2>
        <div className="mt-3">
          {(oppgaver?.length ?? 0) === 0 ? (
            <p className="text-sm text-demp">Ingen åpne oppgaver.</p>
          ) : (
            <OppgaveListe oppgaver={oppgaver!} />
          )}
        </div>
      </section>

      {/* Gjeldsoversikt + nedbetalingsplan */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Gjeldsoversikt</h2>
          {totalGjeld > 0 ? (
            <p className="text-sm text-demp">
              Totalt <strong className="text-blekk">{kr(totalGjeld)}</strong>
            </p>
          ) : null}
        </div>

        {(gjeld?.length ?? 0) === 0 ? (
          <TomTilstand
            tittel="Ingen gjeld registrert"
            tekst="Importer en låneavtale, eller legg inn gjeld manuelt under, så får du nedbetalingsplan og renteradar."
            handling={<KnappLenke href="/app/import" variant="sekundar">Importer låneavtale</KnappLenke>}
          />
        ) : (
          <Nedbetalingsplan
            gjeld={gjeld!.map((g) => ({
              id: g.id,
              creditor: g.creditor,
              principal: g.principal,
              interestRate: g.interest_rate ?? 0,
              monthlyPayment: g.monthly_payment ?? 0,
            }))}
          />
        )}

        <GjeldSkjema />
      </section>
    </div>
  );
}
