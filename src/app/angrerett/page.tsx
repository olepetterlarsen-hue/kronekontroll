import type { Metadata } from "next";
import { Avsnitt, JusSide } from "@/components/jusside";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Angrerett",
  description: "Slik bruker du angreretten på Kronekontroll-abonnementet: 14 dager, full refusjon, ferdig utfyllbart skjema.",
  alternates: { canonical: "/angrerett" },
};

export default function Angrerett() {
  return (
    <JusSide tittel="Angrerett" oppdatert="11. juli 2026">
      <Avsnitt tittel="14 dager, uten begrunnelse">
        <p>
          Som forbruker har du rett til å gå fra avtalen innen 14 dager etter at du startet
          betalt abonnement, uten å oppgi grunn (angrerettloven). Da refunderer vi hele beløpet du
          har betalt.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Slik angrer du">
        <p>
          Send en e-post til {site.supportEmail} med emnet &quot;Angrerett&quot; fra e-postadressen
          kontoen er registrert på, eller bruk skjemaet under. Du trenger ikke begrunne noe.
          Refusjonen skjer til samme betalingsmåte innen 14 dager.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Angreskjema">
        <p>Kopier gjerne denne teksten inn i e-posten:</p>
        <pre className="whitespace-pre-wrap rounded-xl border border-linje bg-flate p-4 text-xs leading-relaxed">
{`Til Kronekontroll (${site.supportEmail})

Jeg benytter meg av angreretten for mitt abonnement på Kronekontroll.

Registrert e-postadresse: ______________________
Dato for kjøp: ______________________
Dato: ______________________`}
        </pre>
      </Avsnitt>
      <Avsnitt tittel="Prøveperioden">
        <p>
          De første {site.trialDays} dagene er uansett gratis og krever ikke betalingskort, så du
          kan prøve tjenesten uten noen forpliktelse i det hele tatt.
        </p>
      </Avsnitt>
    </JusSide>
  );
}
