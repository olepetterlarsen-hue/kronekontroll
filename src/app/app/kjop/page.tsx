import Link from "next/link";
import { redirect } from "next/navigation";
import { BILKOSTNADER } from "@/lib/config/bilkostnader";
import { kr } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { KjopPlanlegger } from "./klient";

export const metadata = { title: "Kjøpsplanlegger" };

export default async function KjopSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const [{ data: lonnsslipp }, { data: gjentakende }, { data: gjeld }, { data: planer }] =
    await Promise.all([
      supabase
        .from("payslips")
        .select("net_pay, period, employer")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("transactions")
        .select("description, amount")
        .eq("user_id", user.id)
        .eq("is_recurring", true)
        .lt("amount", 0)
        .limit(200),
      supabase
        .from("debts")
        .select("principal, monthly_payment")
        .eq("user_id", user.id)
        .eq("status", "aktiv"),
      supabase
        .from("purchase_plans")
        .select("id, title, price, monthly_saving, already_saved, is_vehicle, finn_url, vehicle_info, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  // Faste utgifter: unike gjentakende trekk (siste forekomst per beskrivelse)
  const fasteMap = new Map<string, number>();
  for (const t of gjentakende ?? []) {
    if (!fasteMap.has(t.description)) fasteMap.set(t.description, Math.abs(t.amount));
  }
  const fasteUtgifter = Math.round([...fasteMap.values()].reduce((s, v) => s + v, 0));

  const gjeldPerMnd = Math.round((gjeld ?? []).reduce((s, g) => s + (g.monthly_payment ?? 0), 0));
  const totalGjeld = Math.round((gjeld ?? []).reduce((s, g) => s + g.principal, 0));
  const nyeste = lonnsslipp?.[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kjøpsplanlegger</h1>
        <p className="mt-1 max-w-2xl text-sm text-demp">
          Lurer du på om du har råd? Legg inn hva du vil kjøpe - eller lim inn en Finn-annonse -
          og få de harde faktaene fra din egen økonomi. Veiledende tall, ikke finansiell
          rådgivning.
        </p>
      </div>

      {!nyeste ? (
        <p className="rounded-kort bg-primar-lys px-5 py-4 text-sm text-primar-mork">
          Tips: last opp en <strong>lønnsslipp</strong> under{" "}
          <Link href="/app/import" className="font-semibold underline">
            Importer
          </Link>{" "}
          først, så sjekker planleggeren sparebeløpet mot faktisk inntekt.
        </p>
      ) : null}

      <KjopPlanlegger
        grunnlag={{
          nettoInntekt: nyeste ? Number(nyeste.net_pay) : null,
          inntektKilde: nyeste ? `${nyeste.employer ?? "lønnsslipp"}${nyeste.period ? `, ${nyeste.period}` : ""}` : null,
          fasteUtgifter,
          gjeldPerMnd,
          totalGjeld,
        }}
        eksisterende={(planer ?? []).map((p) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          monthly_saving: Number(p.monthly_saving),
          already_saved: Number(p.already_saved),
          is_vehicle: p.is_vehicle,
          finn_url: p.finn_url,
          vehicle_info: p.vehicle_info as { aarsmodell: number | null; km: number | null; drivstoff: string } | null,
        }))}
      />

      <p className="text-xs text-demp">
        Bilkostnadene er veiledende anslag per {BILKOSTNADER.sistOppdatert} (f.eks. forsikring{" "}
        {kr(BILKOSTNADER.forsikringPerAar)}/år) og varierer med alder, bosted og kjørelengde.
      </p>
    </div>
  );
}
