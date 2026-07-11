import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/marketing";
import { LoggUtKnapp, StartBetalingKnapp } from "@/components/app/klient";
import { harTilgang } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { dagerTil } from "@/lib/format";

export const metadata: Metadata = {
  title: "Oversikt",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/app", label: "Oversikt" },
  { href: "/app/import", label: "Importer" },
  { href: "/app/gjeld", label: "Gjeld og frister" },
  { href: "/app/epost", label: "E-postverksted" },
  { href: "/app/sparemaal", label: "Sparemål" },
  { href: "/app/innstillinger", label: "Innstillinger" },
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, subscription_status, trial_ends_at, is_admin")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/logg-inn");

  const tilgang = harTilgang(profile);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidemeny */}
      <aside className="border-b border-linje bg-flate lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Logo />
          <div className="lg:mt-8">
            <nav aria-label="Appmeny" className="flex gap-1 overflow-x-auto lg:flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-demp transition-colors hover:bg-primar-lys hover:text-primar-mork"
                >
                  {item.label}
                </Link>
              ))}
              {profile.is_admin ? (
                <Link
                  href="/admin"
                  className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-aksent transition-colors hover:bg-aksent-lys"
                >
                  Admin
                </Link>
              ) : null}
            </nav>
            <div className="mt-2 lg:mt-8">
              <LoggUtKnapp />
            </div>
          </div>
        </div>
      </aside>

      {/* Innhold */}
      <div className="flex-1">
        {!tilgang.tilgang ? (
          <main className="mx-auto max-w-lg px-4 py-24 text-center">
            <h1 className="text-3xl font-bold">Prøveperioden er over</h1>
            <p className="mt-3 text-demp">
              Håper de to ukene ga deg bedre oversikt! For 49 kr i måneden fortsetter du der du
              slapp - alle data og dokumenter ligger trygt og venter.
            </p>
            <div className="mt-8">
              <StartBetalingKnapp />
            </div>
            <p className="mt-4 text-xs text-demp">
              Vil du heller avslutte? Du kan laste ned eller slette dataene dine under{" "}
              <Link href="/app/innstillinger" className="underline">Innstillinger</Link>.
            </p>
          </main>
        ) : (
          <>
            {tilgang.grunn === "prove" ? (
              <div className="border-b border-linje bg-primar-lys px-4 py-2.5 text-center text-sm text-primar-mork">
                {dagerTil(profile.trial_ends_at)} dager igjen av prøveperioden.{" "}
                <StartBetalingKnapp variant="lenke" />
              </div>
            ) : null}
            {tilgang.grunn === "betaling_feilet" ? (
              <div className="border-b border-linje bg-varsel-lys px-4 py-2.5 text-center text-sm text-varsel">
                Siste betaling feilet. Oppdater kortet under Innstillinger for å beholde tilgangen.
              </div>
            ) : null}
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
          </>
        )}
      </div>
    </div>
  );
}
