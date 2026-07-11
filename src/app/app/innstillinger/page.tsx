import { redirect } from "next/navigation";
import { Kort } from "@/components/ui";
import { AapnePortalKnapp, StartBetalingKnapp } from "@/components/app/klient";
import { datoKort } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ProfilSkjema, SlettKonto, VarslerSkjema } from "./klient";

export const metadata = { title: "Innstillinger" };

export default async function InnstillingerSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const [{ data: profile }, { data: varsler }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, subscription_status, trial_ends_at, stripe_customer_id")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notification_settings")
      .select("task_reminders, weekly_summary, savings_milestones")
      .eq("user_id", user.id)
      .single(),
  ]);
  if (!profile) redirect("/logg-inn");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Innstillinger</h1>

      <Kort>
        <h2 className="font-semibold">Profil</h2>
        <p className="mt-1 text-sm text-demp">Innlogget som {profile.email}</p>
        <div className="mt-4">
          <ProfilSkjema navn={profile.full_name ?? ""} />
        </div>
      </Kort>

      <Kort>
        <h2 className="font-semibold">Abonnement</h2>
        <p className="mt-1 text-sm text-demp">
          {profile.subscription_status === "active"
            ? "Aktivt abonnement, 49 kr/mnd."
            : profile.subscription_status === "past_due"
              ? "Siste betaling feilet. Oppdater betalingskortet for å beholde tilgangen."
              : profile.subscription_status === "canceled"
                ? "Abonnementet er avsluttet."
                : `Gratis prøveperiode til ${datoKort(profile.trial_ends_at)}.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {profile.stripe_customer_id && profile.subscription_status !== "trial" ? (
            <AapnePortalKnapp />
          ) : (
            <StartBetalingKnapp />
          )}
        </div>
        <p className="mt-3 text-xs text-demp">
          Oppsigelse skjer i betalingsportalen med to klikk, og gjelder fra neste fornyelse. 14
          dagers angrerett ved kjøp.
        </p>
      </Kort>

      <Kort>
        <h2 className="font-semibold">Varsler på e-post</h2>
        <div className="mt-4">
          <VarslerSkjema
            verdier={{
              task_reminders: varsler?.task_reminders ?? true,
              weekly_summary: varsler?.weekly_summary ?? false,
              savings_milestones: varsler?.savings_milestones ?? true,
            }}
          />
        </div>
      </Kort>

      <Kort>
        <h2 className="font-semibold">Dine data</h2>
        <p className="mt-1 text-sm text-demp">
          Dataene er dine. Last ned alt som én fil, eller slett kontoen og alt innhold permanent.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/api/gdpr/eksport"
            className="inline-flex items-center justify-center rounded-full border border-linje bg-flate px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primar hover:text-primar"
          >
            Last ned mine data
          </a>
          <SlettKonto />
        </div>
      </Kort>
    </div>
  );
}
