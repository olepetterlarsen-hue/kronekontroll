import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Kort, StatKort } from "@/components/ui";
import { kr } from "@/lib/format";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { Innholdsstudio } from "./innholdsstudio";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/app");

  // Nøkkeltall. RLS på profiles gir vanlige brukere kun egen rad, men admin
  // trenger aggregater - vi teller via dokumenterte count-spørringer som
  // returnerer antall, aldri innhold. (Admin har ikke tilgang til brukernes
  // dokumenter eller transaksjoner - det finnes ingen policy for det, med vilje.)
  const [alleBrukere, aktive, prøver, feilede, { data: kø }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("subscription_status", "active"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("subscription_status", "trial"),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "feilet"),
    supabase
      .from("social_posts")
      .select("id, platform, format, title, body, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const antallAktive = aktive.count ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backoffice</h1>
        <Link href="/app" className="text-sm font-semibold text-primar hover:underline">
          ← Til appen
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatKort tittel="Brukere" verdi={String(alleBrukere.count ?? 0)} />
        <StatKort
          tittel="Betalende"
          verdi={String(antallAktive)}
          under={`MRR ${kr(antallAktive * site.priceNokPerMonth)}`}
          tone="positiv"
        />
        <StatKort tittel="I prøveperiode" verdi={String(prøver.count ?? 0)} />
        <StatKort
          tittel="Feilede tolkninger"
          verdi={String(feilede.count ?? 0)}
          tone={(feilede.count ?? 0) > 0 ? "negativ" : "noytral"}
        />
      </div>

      <Kort>
        <p className="text-sm leading-relaxed text-demp">
          Merk: admin har med vilje ikke tilgang til brukernes dokumenter, transaksjoner eller
          gjeld - det finnes ingen database-policy som åpner for det. Support løses ved at brukeren
          selv deler det som trengs.
        </p>
      </Kort>

      <Innholdsstudio kø={kø ?? []} />
    </div>
  );
}
