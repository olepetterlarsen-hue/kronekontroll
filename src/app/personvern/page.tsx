import type { Metadata } from "next";
import { Avsnitt, JusSide } from "@/components/jusside";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description: "Slik behandler Kronekontroll personopplysningene dine: hva vi lagrer, hvorfor, hvor lenge, og hvilke rettigheter du har.",
  alternates: { canonical: "/personvern" },
};

export default function Personvern() {
  return (
    <JusSide tittel="Personvernerklæring" oppdatert="11. juli 2026">
      <Avsnitt tittel="Kort fortalt">
        <p>
          Du laster opp økonomiske dokumenter for at Kronekontroll skal hjelpe deg. Dataene er dine:
          vi lagrer dem kryptert i EU, selger dem aldri, deler dem aldri med andre for deres egne formål, og bruker dem ikke til annet enn å gi
          deg tjenesten, og du kan laste ned eller slette alt selv, når som helst.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Behandlingsansvarlig">
        <p>
          Behandlingsansvarlig er Echoo AS (org.nr 935 228 387), som utvikler og drifter Kronekontroll. Ved overføring til eget selskap oppdateres denne erklæringen og du varsles på e-post.
          Spørsmål om personvern: {site.supportEmail}.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Hva vi behandler, og hvorfor">
        <p>
          Kontoinformasjon (e-post, navn) for å gi deg en konto - grunnlag: avtalen med deg.
          Dokumentene du selv laster opp (kontoutskrifter, inkassobrev, låneavtaler, e-poster) og
          dataene som trekkes ut av dem - grunnlag: avtalen med deg. Betalingsstatus fra Stripe for
          å administrere abonnementet. Vi lagrer aldri fødselsnummer: oppdages det i et dokument,
          maskeres det før lagring. Vi lagrer heller ikke kortnummer - betaling håndteres av Stripe.
        </p>
      </Avsnitt>
      <Avsnitt tittel="AI-behandling av dokumenter">
        <p>
          Dokumenter du laster opp tolkes av en språkmodell (Claude fra Anthropic) for å trekke ut
          transaksjoner, beløp og frister. Behandlingen skjer per dokument, kun for deg, og
          leverandøren bruker ikke innholdet til å trene modeller. Innholdet i dokumentene logges
          aldri hos oss.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Databehandlere">
        <p>
          Vi bruker et lite antall underleverandører med databehandleravtale: Supabase (database og
          fillagring, EU), Vercel (drift, EU-region), Stripe (betaling), Resend (utsending av
          e-postvarsler) og Anthropic (dokumenttolkning). Ingen av dem kan bruke dataene dine til
          egne formål.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Lagring og sletting">
        <p>
          Data lagres så lenge du har konto. Sletter du kontoen (Innstillinger → Slett kontoen min),
          slettes alt umiddelbart fra tjenesten: dokumenter, uttrukne data, profil og betalingsprofil.
          Data i tekniske sikkerhetskopier roteres ut innen 30 dager.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Dine rettigheter">
        <p>
          Du har rett til innsyn, retting, sletting, dataportabilitet og å klage til Datatilsynet.
          Innsyn og portabilitet er selvbetjent: last ned alle dataene dine som én fil under
          Innstillinger. Resten ordner du ved å kontakte {site.supportEmail}.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Informasjonskapsler og sporing">
        <p>
          Vi bruker kun nødvendige informasjonskapsler for innlogging. Ingen tredjeparts
          annonsesporing, ingen videresalg av data.
        </p>
      </Avsnitt>
    </JusSide>
  );
}
