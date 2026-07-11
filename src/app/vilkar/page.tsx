import type { Metadata } from "next";
import { Avsnitt, JusSide } from "@/components/jusside";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vilkår for bruk",
  description: "Vilkår for bruk av Kronekontroll: abonnement, pris, oppsigelse, angrerett og ansvarsbegrensning.",
  alternates: { canonical: "/vilkar" },
};

export default function Vilkar() {
  return (
    <JusSide tittel="Vilkår for bruk" oppdatert="11. juli 2026">
      <Avsnitt tittel="Tjenesten">
        <p>
          Kronekontroll er et selvbetjent verktøy for privatøkonomi: oversikt over forbruk, gjeld og
          sparemål, kontroller av inkassokrav og gebyrer, og generering av e-postutkast du selv
          sender. Kronekontroll er programvare, ikke finansrådgivning: {site.disclaimer}
        </p>
      </Avsnitt>
      <Avsnitt tittel="Pris og betaling">
        <p>
          Abonnementet koster {site.priceNokPerMonth} kr per måned og fornyes automatisk. Nye
          brukere får {site.trialDays} dagers gratis prøveperiode uten betalingskort. Betaling
          håndteres av Stripe. Prisendringer varsles minst 30 dager i forveien på e-post.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Oppsigelse">
        <p>
          Du kan si opp når som helst under Innstillinger → Administrer abonnement. Oppsigelsen
          gjelder fra neste fornyelse, og det er like enkelt å si opp som å bli kunde. Kontoen og
          dataene dine består til du eventuelt sletter dem selv.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Angrerett">
        <p>
          Som forbruker har du 14 dagers angrerett fra kjøpstidspunktet etter angrerettloven. Se
          egen side om angrerett for fremgangsmåte og skjema.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Ditt ansvar">
        <p>
          Du er ansvarlig for at dokumentene du laster opp gjelder deg selv (eller noen du har
          fullmakt for), og for å lese gjennom alle e-postutkast før du sender dem. Automatiske
          tolkninger og kontroller kan inneholde feil - kontroller alltid tall og frister mot
          originaldokumentet før du handler på dem.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Ansvarsbegrensning">
        <p>
          Kronekontroll gir generell veiledning basert på dokumentene du laster opp, og erstatter
          ikke profesjonell rådgivning fra advokat, gjeldsrådgiver (f.eks. NAV sin gratis
          gjeldsrådgivning) eller bank. Vi er ikke ansvarlige for tap som følge av beslutninger du
          tar basert på tjenesten, utover det som følger av ufravikelig forbrukerlovgivning.
        </p>
      </Avsnitt>
      <Avsnitt tittel="Endringer i vilkårene">
        <p>Vesentlige endringer varsles på e-post minst 30 dager før de trer i kraft.</p>
      </Avsnitt>
    </JusSide>
  );
}
