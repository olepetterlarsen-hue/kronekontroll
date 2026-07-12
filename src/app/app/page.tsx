import Link from "next/link";
import { redirect } from "next/navigation";
import { Etikett, Kort, StatKort, TomTilstand, KnappLenke } from "@/components/ui";
import { aarligMerkostnad, REFERANSERENTER } from "@/lib/config/renter";
import { datoKort, kr } from "@/lib/format";
import { KATEGORI_NAVN, type Kategori } from "@/lib/kategorier";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const nå = new Date();
  const månedStart = new Date(nå.getFullYear(), nå.getMonth(), 1).toISOString().slice(0, 10);

  const [{ data: txDenneMnd }, { data: gjentakende }, { data: gjeld }, { data: oppgaver }, { data: mål }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("amount, category")
        .eq("user_id", user.id)
        .gte("tx_date", månedStart),
      supabase
        .from("transactions")
        .select("description, amount, tx_date")
        .eq("user_id", user.id)
        .eq("is_recurring", true)
        .eq("category", "abonnementer") // jegeren jakter abonnementer, ikke husleie og avdrag
        .lt("amount", 0)
        .order("tx_date", { ascending: false })
        .limit(200),
      supabase
        .from("debts")
        .select("id, creditor, debt_type, principal, interest_rate")
        .eq("user_id", user.id)
        .eq("status", "aktiv"),
      supabase
        .from("tasks")
        .select("id, title, due_date, source")
        .eq("user_id", user.id)
        .eq("status", "aapen")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
      supabase
        .from("savings_goals")
        .select("id, name, target_amount, saved_amount")
        .eq("user_id", user.id)
        .is("completed_at", null)
        .limit(3),
    ]);

  // Månedens forbruk per kategori
  const forbruk = (txDenneMnd ?? []).filter((t) => t.amount < 0);
  const totalForbruk = forbruk.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const perKategori = new Map<string, number>();
  for (const t of forbruk) {
    perKategori.set(t.category, (perKategori.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const kategorier = [...perKategori.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Abonnementsjeger: unike gjentakende trekk (siste forekomst per beskrivelse)
  const abonnementer = new Map<string, number>();
  for (const t of gjentakende ?? []) {
    if (!abonnementer.has(t.description)) abonnementer.set(t.description, Math.abs(t.amount));
  }
  const absListe = [...abonnementer.entries()].sort((a, b) => b[1] - a[1]);
  const absÅrskost = absListe.reduce((sum, [, beløp]) => sum + beløp * 12, 0);

  // Renteradar
  const renteFunn = (gjeld ?? [])
    .filter((g) => g.interest_rate != null)
    .map((g) => ({ gjeld: g, funn: aarligMerkostnad(g.principal, g.interest_rate!, g.debt_type) }))
    .filter((x) => x.funn !== null);
  const totalMerkostnad = renteFunn.reduce((sum, x) => sum + (x.funn?.merkostnad ?? 0), 0);

  const harData = (txDenneMnd?.length ?? 0) > 0 || (gjeld?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Oversikt</h1>
        <p className="mt-1 text-sm text-demp">
          {nå.toLocaleDateString("nb-NO", { month: "long", year: "numeric" })}
        </p>
      </div>

      {!harData ? (
        <TomTilstand
          tittel="Velkommen! La oss få inn tallene dine"
          tekst="Last opp en kontoutskrift, et inkassobrev eller en låneavtale, så bygger Kronekontroll oversikten for deg på under et minutt."
          handling={<KnappLenke href="/app/import">Importer første dokument</KnappLenke>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatKort tittel="Forbruk denne måneden" verdi={kr(totalForbruk)} />
            <StatKort
              tittel="Faste trekk funnet"
              verdi={`${absListe.length} stk`}
              under={absListe.length > 0 ? `${kr(absÅrskost)} i året` : undefined}
              tone={absListe.length > 3 ? "negativ" : "noytral"}
            />
            <StatKort
              tittel="Mulig rentebesparelse"
              verdi={totalMerkostnad > 0 ? `${kr(totalMerkostnad)}/år` : "Ser bra ut"}
              under={totalMerkostnad > 0 ? "sammenlignet med veiledende nivå" : "ingen lån over referanserenten"}
              tone={totalMerkostnad > 0 ? "negativ" : "positiv"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Forbruk per kategori */}
            <Kort>
              <h2 className="font-semibold">Hvor pengene går</h2>
              {kategorier.length === 0 ? (
                <p className="mt-3 text-sm text-demp">Ingen transaksjoner denne måneden ennå.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {kategorier.map(([kategori, beløp]) => (
                    <li key={kategori}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span>{KATEGORI_NAVN[kategori as Kategori] ?? kategori}</span>
                        <span className="font-semibold tabular-nums">{kr(beløp)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-flate-demp" aria-hidden>
                        <div
                          className="h-2 rounded-full bg-primar"
                          style={{ width: `${Math.max(4, Math.round((beløp / totalForbruk) * 100))}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Kort>

            {/* Frister */}
            <Kort>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Neste frister</h2>
                <Link href="/app/gjeld" className="text-sm font-semibold text-primar hover:underline">
                  Se alle
                </Link>
              </div>
              {(oppgaver?.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-demp">Ingen åpne oppgaver. Godt jobba!</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {oppgaver!.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{o.title}</span>
                      {o.due_date ? (
                        <Etikett tone={dagerIgjen(o.due_date) <= 3 ? "negativ" : "varsel"}>
                          {datoKort(o.due_date)}
                        </Etikett>
                      ) : (
                        <Etikett>uten frist</Etikett>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Kort>

            {/* Abonnementsjeger */}
            <Kort>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Abonnementsjegeren</h2>
                <Link
                  href="/app/epost?mal=oppsigelse_abonnement"
                  className="text-sm font-semibold text-primar hover:underline"
                >
                  Si opp noe
                </Link>
              </div>
              {absListe.length === 0 ? (
                <p className="mt-3 text-sm text-demp">
                  Ingen faste trekk funnet ennå. Importer en kontoutskrift, så leter vi.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {absListe.slice(0, 6).map(([navn, beløp]) => (
                    <li key={navn} className="flex items-baseline justify-between text-sm">
                      <span className="min-w-0 truncate">{navn}</span>
                      <span className="ml-3 shrink-0 tabular-nums text-demp">
                        {kr(beløp)}/mnd · <span className="font-semibold text-blekk">{kr(beløp * 12)}/år</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Kort>

            {/* Renteradar */}
            <Kort>
              <h2 className="font-semibold">Renteradaren</h2>
              {renteFunn.length === 0 ? (
                <p className="mt-3 text-sm text-demp">
                  Ingen lån over veiledende rentenivå. Legg inn lån under Gjeld for å følge med.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {renteFunn.map(({ gjeld: g, funn }) => (
                    <li key={g.id} className="rounded-xl bg-negativ-lys/60 p-3 text-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold">{g.creditor}</span>
                        <span className="tabular-nums text-negativ">+{kr(funn!.merkostnad)}/år</span>
                      </div>
                      <p className="mt-1 text-xs text-demp">
                        Din rente {g.interest_rate} % mot veiledende {funn!.referanse} %.{" "}
                        <Link
                          href="/app/epost?mal=rentenedsettelse"
                          className="font-semibold text-primar hover:underline"
                        >
                          Lag forhandlings-e-post
                        </Link>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-demp">
                Veiledende nivåer per {REFERANSERENTER.sistOppdatert}. Sjekk Finansportalen for
                oppdaterte satser.
              </p>
            </Kort>
          </div>

          {/* Sparemål */}
          {(mål?.length ?? 0) > 0 ? (
            <Kort>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Sparemål</h2>
                <Link href="/app/sparemaal" className="text-sm font-semibold text-primar hover:underline">
                  Se alle
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {mål!.map((m) => {
                  const pct = m.target_amount > 0 ? Math.min(100, Math.round((m.saved_amount / m.target_amount) * 100)) : 0;
                  return (
                    <div key={m.id}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium">{m.name}</span>
                        <span className="tabular-nums text-demp">{pct} %</span>
                      </div>
                      <div className="mt-1.5 h-2.5 rounded-full bg-flate-demp" aria-hidden>
                        <div className="h-2.5 rounded-full bg-positiv" style={{ width: `${Math.max(3, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Kort>
          ) : null}
        </>
      )}
    </div>
  );
}

function dagerIgjen(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
