import { redirect } from "next/navigation";
import { TomTilstand } from "@/components/ui";
import { kr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { MaalKort, NyttMaalSkjema } from "./klient";

export const metadata = { title: "Sparemål" };

export default async function SparemaalSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const [{ data: mål }, { data: gjentakende }] = await Promise.all([
    supabase
      .from("savings_goals")
      .select("id, name, target_amount, saved_amount, target_date, completed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("description, amount")
      .eq("user_id", user.id)
      .eq("is_recurring", true)
      .eq("category", "abonnementer") // anbefal kutt i abonnementer, aldri husleie o.l.
      .lt("amount", 0)
      .limit(100),
  ]);

  // Konkret anbefaling: største gjentakende trekk = raskeste vei til målet
  const kandidater = new Map<string, number>();
  for (const t of gjentakende ?? []) {
    if (!kandidater.has(t.description)) kandidater.set(t.description, Math.abs(t.amount));
  }
  const størsteTrekk = [...kandidater.entries()].sort((a, b) => b[1] - a[1])[0];

  const aktive = (mål ?? []).filter((m) => !m.completed_at);
  const fullførte = (mål ?? []).filter((m) => m.completed_at);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sparemål</h1>
        <p className="mt-1 text-sm text-demp">
          Sett et mål, oppdater fremdriften, og få et lite puff når du passerer milepæler.
        </p>
      </div>

      {aktive.length === 0 && fullførte.length === 0 ? (
        <TomTilstand
          tittel="Ingen sparemål ennå"
          tekst="Buffer, ferie eller egenkapital? Sett det første målet under - folk med konkrete mål sparer mer."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {aktive.map((m) => (
            <MaalKort
              key={m.id}
              maal={m}
              anbefaling={
                størsteTrekk && m.target_amount > m.saved_amount
                  ? `Tips: kutter du «${størsteTrekk[0]}» (${kr(størsteTrekk[1])}/mnd), når du målet ${
                      Math.ceil((m.target_amount - m.saved_amount) / størsteTrekk[1])
                    } måneder raskere.`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <NyttMaalSkjema />

      {fullførte.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Nådde mål 🎉</h2>
          <ul className="mt-3 space-y-2">
            {fullførte.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-kort border border-positiv/30 bg-positiv-lys px-4 py-3 text-sm"
              >
                <span className="font-medium text-positiv">{m.name}</span>
                <span className="tabular-nums text-positiv">{kr(m.target_amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
