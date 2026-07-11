import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing";
import { site } from "@/lib/site";

const beskrivelse =
  "Se hvor pengene lekker, stopp gjeld før det blir inkasso, og nå sparemålene dine. Last opp kontoutskriften - Kronekontroll gjør resten. Prøv gratis i 14 dager.";

export const metadata: Metadata = {
  title: `${site.name} - få kontroll på pengene dine for 49 kr i måneden`,
  description: beskrivelse,
  alternates: { canonical: "/" },
};

const FUNKSJONER = [
  {
    tittel: "Slipp alt i én innboks",
    tekst:
      "Kontoutskrifter, inkassobrev, låneavtaler og e-poster. Last opp, så leser Kronekontroll dokumentene for deg og gjør dem om til oversikt, frister og konkrete grep.",
  },
  {
    tittel: "Betaler du for mye?",
    tekst:
      "Abonnementsjegeren finner faste trekk du har glemt. Renteradaren viser hva lånene dine koster mot markedsnivå, i kroner per år, ikke prosentpoeng.",
  },
  {
    tittel: "Stopp gjelden i tide",
    tekst:
      "Full oversikt over gjeld og inkassokrav, med varsler før neste steg i inkassoløpet. Inkassokontrollen flagger gebyrer og salær som ser for høye ut.",
  },
  {
    tittel: "Ferdige e-poster, du sender",
    tekst:
      "Be om betalingsplan, bestrid et krav, forhandle renta eller si opp et abonnement. Kronekontroll skriver utkastet, du leser gjennom og sender selv.",
  },
  {
    tittel: "Sparemål som faktisk nås",
    tekst:
      "Sett mål, følg fremdriften automatisk fra kontoutskriftene, og få konkrete forslag til hva som får deg raskere i mål.",
  },
  {
    tittel: "Varsler før det haster",
    tekst:
      "E-post når en frist nærmer seg, når et sparemål passeres, og når noe trenger et svar fra deg. Aldri mas, alltid i tide.",
  },
];

const TRYGGHET = [
  ["Norsk tjeneste", "Bygget for norske banker, norsk inkassolovgivning og norske lommebøker."],
  ["Lagret i EU", "Dataene dine ligger kryptert i EU og deles aldri med tredjeparter."],
  ["Du eier dataene", "Last ned alt eller slett kontoen med ett klikk, når som helst."],
  ["Ingen sporing", "Ingen tredjeparts annonsesporing. Du er kunden, ikke produktet."],
] as const;

const FAQ = [
  {
    sp: "Hva koster Kronekontroll?",
    sv: "49 kroner i måneden etter 14 dagers gratis prøveperiode. Ingen bindingstid, og du sier opp selv med to klikk under Innstillinger.",
  },
  {
    sp: "Er dette trygt?",
    sv: "Ja. Dokumentene dine lagres kryptert i EU, bak tilgangskontroll på databasenivå som gjør at ingen andre brukere kan se dine data. Vi lagrer aldri fødselsnummer, og vi selger aldri data.",
  },
  {
    sp: "Forhandler dere med kreditorene for meg?",
    sv: "Nei. Kronekontroll er et verktøy, ikke en gjeldsmegler. Vi gir deg oversikten, kontrollene og ferdige e-postutkast - men det er alltid du som leser gjennom og sender. Det gir deg full kontroll over egen sak.",
  },
  {
    sp: "Hvilke banker støttes?",
    sv: "Alle. Du laster opp kontoutskrift som PDF eller CSV, som alle norske banker tilbyr. Automatisk banksynk kommer som valgfritt tillegg senere.",
  },
  {
    sp: "Hva skjer med dataene mine hvis jeg sier opp?",
    sv: "Du kan laste ned alt som en fil, og du kan slette kontoen selv. Da slettes alt: dokumenter, transaksjoner og profilen din.",
  },
];

export default function Landingsside() {
  return (
    <>
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="max-w-3xl">
            <p className="ktr-inn inline-flex items-center gap-2 rounded-full bg-primar-lys px-3 py-1 text-xs font-semibold text-primar-mork">
              Norsk · 49 kr/mnd · 14 dager gratis
            </p>
            <h1 className="ktr-inn mt-5 text-4xl font-bold leading-tight sm:text-6xl">
              Ro i magen.
              <br />
              <span className="text-primar">Kontroll på krona.</span>
            </h1>
            <p className="ktr-inn mt-6 max-w-xl text-lg leading-relaxed text-demp">
              Last opp kontoutskrifter, inkassobrev og låneavtaler. Kronekontroll viser hvor
              pengene lekker, stopper gjeld før den vokser, og skriver e-postene du gruer deg til.
            </p>
            <div className="ktr-inn mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/registrer"
                className="rounded-full bg-primar px-7 py-3.5 text-base font-semibold text-white shadow-svev transition-colors hover:bg-primar-mork"
              >
                Prøv gratis i 14 dager
              </Link>
              <span className="text-sm text-demp">Uten kort. Avslutt når du vil.</span>
            </div>
          </div>

          {/* Produktglimt */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              ["Abonnementer funnet", "7 stk", "2 340 kr/år du kan kutte"],
              ["Neste frist", "12. aug", "Inkassovarsel fra Kreditor AS"],
              ["Sparemål: Buffer", "68 %", "20 400 av 30 000 kr"],
            ].map(([tittel, verdi, under], i) => (
              <div
                key={tittel}
                className="ktr-inn rounded-kort border border-linje bg-flate p-6 shadow-kort"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-demp">{tittel}</p>
                <p className="mt-2 font-display text-3xl font-bold text-primar-mork">{verdi}</p>
                <p className="mt-1 text-xs text-demp">{under}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Funksjoner */}
        <section id="funksjoner" className="border-y border-linje bg-flate py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Alt det kjipe med penger, gjort håndterbart
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FUNKSJONER.map((f) => (
                <div key={f.tittel} className="rounded-kort border border-linje bg-bakgrunn p-6">
                  <h3 className="text-lg font-semibold">{f.tittel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-demp">{f.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trygghet */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Laget for å være til å stole på</h2>
            <p className="mt-3 max-w-xl text-demp">
              Du deler noe av det mest private som finnes. Det tar vi på største alvor.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TRYGGHET.map(([tittel, tekst]) => (
                <div key={tittel} className="rounded-kort bg-primar-lys/60 p-6">
                  <h3 className="font-semibold text-primar-mork">{tittel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-demp">{tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pris */}
        <section id="pris" className="border-y border-linje bg-flate py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Én pris. Alt inkludert.</h2>
            <div className="mx-auto mt-10 max-w-sm rounded-kort border-2 border-primar bg-bakgrunn p-8 shadow-svev">
              <p className="font-display text-5xl font-bold text-primar-mork">
                49 kr<span className="text-lg font-semibold text-demp">/mnd</span>
              </p>
              <p className="mt-2 text-sm text-demp">14 dager gratis først. Ingen bindingstid.</p>
              <ul className="mt-6 space-y-2 text-left text-sm text-blekk">
                {[
                  "Ubegrenset dokumentimport",
                  "Abonnementsjeger og renteradar",
                  "Gjeldsoversikt og inkassokontroll",
                  "E-postverksted med ferdige utkast",
                  "Sparemål og fristvarsler",
                ].map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2">
                    <span aria-hidden className="mt-0.5 text-positiv">
                      ✓
                    </span>{" "}
                    {punkt}
                  </li>
                ))}
              </ul>
              <Link
                href="/registrer"
                className="mt-8 block rounded-full bg-primar px-6 py-3 font-semibold text-white transition-colors hover:bg-primar-mork"
              >
                Kom i gang gratis
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Vanlige spørsmål</h2>
            <dl className="mt-10 space-y-4">
              {FAQ.map((item) => (
                <div key={item.sp} className="rounded-kort border border-linje bg-flate p-6">
                  <dt className="font-semibold">{item.sp}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-demp">{item.sv}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <MarketingFooter />

      {/* Strukturerte data for søkemotorer og AI-assistenter */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: site.name,
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              inLanguage: "nb",
              url: site.url,
              description: beskrivelse,
              offers: {
                "@type": "Offer",
                price: String(site.priceNokPerMonth),
                priceCurrency: "NOK",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.sp,
                acceptedAnswer: { "@type": "Answer", text: f.sv },
              })),
            },
          ]),
        }}
      />
    </>
  );
}
