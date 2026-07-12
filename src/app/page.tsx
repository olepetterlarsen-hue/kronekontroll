import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing";
import {
  IkonEpost,
  IkonImport,
  IkonRadar,
  IkonSkjold,
  IkonSparemaal,
  IkonVarsel,
} from "@/components/ikoner";
import { site } from "@/lib/site";

const beskrivelse =
  "Se hvor pengene lekker, stopp gjeld før det blir inkasso, og nå sparemålene dine. Last opp kontoutskriften - Kronekontroll gjør resten. Prøv gratis i 14 dager.";

export const metadata: Metadata = {
  title: `${site.name} - få kontroll på pengene dine for 49 kr i måneden`,
  description: beskrivelse,
  alternates: { canonical: "/" },
};

const STEG = [
  {
    nr: "1",
    tittel: "Slipp dokumentene her",
    tekst:
      "Kontoutskrift, inkassobrev, låneavtale eller e-post. Kronekontroll leser alt og gjør det om til tall du forstår - på under et minutt.",
  },
  {
    nr: "2",
    tittel: "Se hva som faktisk skjer",
    tekst:
      "Hvor pengene går, hvilke abonnementer som tapper deg, hvilke lån som er for dyre, og hvilke frister som nærmer seg.",
  },
  {
    nr: "3",
    tittel: "Handle med ferdige utkast",
    tekst:
      "Si opp, bestrid, forhandle. E-posten ligger ferdig skrevet - du leser gjennom, justerer og sender selv.",
  },
];

const FUNKSJONER = [
  {
    ikon: <IkonImport />,
    tittel: "Slipp alt i én innboks",
    tekst:
      "Kontoutskrifter, inkassobrev, låneavtaler og e-poster. Last opp, så blir dokumentene til oversikt, frister og konkrete grep. Fødselsnummer maskeres automatisk.",
    bred: true,
  },
  {
    ikon: <IkonRadar />,
    tittel: "Betaler du for mye?",
    tekst:
      "Abonnementsjegeren finner faste trekk du har glemt. Renteradaren viser hva lånene koster mot markedsnivå - i kroner per år.",
  },
  {
    ikon: <IkonEpost />,
    tittel: "Ferdige e-poster, du sender",
    tekst:
      "Betalingsplan, innsigelse, renteforhandling eller oppsigelse. Utkastet ligger klart - du har alltid siste ord.",
  },
  {
    ikon: <IkonSparemaal />,
    tittel: "Sparemål som faktisk nås",
    tekst:
      "Sett mål, følg fremdriften automatisk, og få konkrete forslag til hva som får deg raskere i mål.",
  },
  {
    ikon: <IkonVarsel />,
    tittel: "Varsler før det haster",
    tekst:
      "E-post når en frist nærmer seg og når et sparemål passeres. Aldri mas, alltid i tide.",
  },
];

const INKASSO_STADIER = ["Purring", "Inkassovarsel", "Betalingsoppfordring", "Anmerkning"];

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
        {/* ===== Hero ===== */}
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-8">
            <div>
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
                pengene lekker, stopper gjeld før den vokser, og skriver e-postene du gruer deg
                til.
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
              <ul className="ktr-inn mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-demp">
                {["Kryptert i EU", "Ingen sporing", "Slett alt når du vil"].map((p) => (
                  <li key={p} className="flex items-center gap-1.5">
                    <span aria-hidden className="text-positiv">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ktr-inn relative mx-auto w-full max-w-xl lg:max-w-none">
              <Image
                src="/illustrasjoner/hero.png"
                alt="Kronekontroll-oversikten: forbruk per kategori, sparemål på 68 prosent og et inkassokrav som er bestridt"
                width={820}
                height={692}
                priority
                className="h-auto w-full rounded-kort border border-linje shadow-svev"
              />
            </div>
          </div>
        </section>

        {/* ===== Slik fungerer det ===== */}
        <section className="border-y border-linje bg-flate py-20" aria-labelledby="steg-tittel">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="steg-tittel" className="text-3xl font-bold sm:text-4xl">
              Fra kaos til kontroll på tre steg
            </h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-3">
              {STEG.map((s) => (
                <li key={s.nr} className="relative rounded-kort border border-linje bg-bakgrunn p-6 pt-8">
                  <span
                    aria-hidden
                    className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-primar font-display text-lg font-bold text-white shadow-kort"
                  >
                    {s.nr}
                  </span>
                  <h3 className="text-lg font-semibold">{s.tittel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-demp">{s.tekst}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== Funksjoner (bento) ===== */}
        <section id="funksjoner" className="py-20" aria-labelledby="funksjoner-tittel">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="funksjoner-tittel" className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Alt det kjipe med penger, gjort håndterbart
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FUNKSJONER.map((f) => (
                <div
                  key={f.tittel}
                  className={`rounded-kort border border-linje bg-flate p-6 shadow-kort transition-shadow hover:shadow-svev ${
                    f.bred ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {f.ikon}
                  <h3 className="mt-4 text-lg font-semibold">{f.tittel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-demp">{f.tekst}</p>
                </div>
              ))}
              {/* Spørsmåls-kort som fyller griden */}
              <div className="flex flex-col justify-center rounded-kort bg-primar-lys p-6">
                <p className="font-display text-3xl font-bold leading-snug text-primar-mork">
                  Hva koster abonnementene dine i året?
                </p>
                <p className="mt-2 text-sm text-primar-mork/80">
                  De fleste vet ikke. Kronekontroll regner det ut av kontoutskriften på sekunder.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Inkasso-spotlight (mørk) ===== */}
        <section className="bg-primar-mork py-20 text-white" aria-labelledby="inkasso-tittel">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <IkonSkjold />
                <h2 id="inkasso-tittel" className="text-3xl font-bold sm:text-4xl">
                  Stopp gjelden i tide
                </h2>
              </div>
              <p className="mt-5 max-w-lg leading-relaxed text-white/80">
                Et inkassovarsel er ikke en dom - det er en frist. Kronekontroll viser hvor saken
                står i løpet, sjekker gebyrer og salær mot satsene i inkassoforskriften, og varsler
                deg før neste steg. Slik handler du før det blir betalingsanmerkning.
              </p>
              <Link
                href="/guider/inkassovarsel-hva-gjor-jeg"
                className="mt-7 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-primar-mork transition-colors hover:bg-primar-lys"
              >
                Les guiden: Fått inkassovarsel?
              </Link>
            </div>
            <div className="rounded-kort bg-white/5 p-6 ring-1 ring-white/15">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Inkassoløpet
              </p>
              <ol className="mt-4 space-y-3">
                {INKASSO_STADIER.map((stadium, i) => (
                  <li key={stadium} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i < 2 ? "bg-aksent text-white" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`h-1.5 flex-1 rounded-full ${i < 2 ? "bg-aksent" : "bg-white/10"}`} />
                    <span className={`w-44 text-sm ${i < 2 ? "font-semibold" : "text-white/60"}`}>
                      {stadium}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 rounded-xl bg-white/10 px-4 py-3 text-sm">
                <span className="font-semibold text-aksent-lys">Kronekontroll varsler her →</span>{" "}
                mens du fortsatt har tid og rettigheter.
              </p>
            </div>
          </div>
        </section>

        {/* ===== Trygghet ===== */}
        <section className="py-20" aria-labelledby="trygghet-tittel">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="trygghet-tittel" className="text-3xl font-bold sm:text-4xl">
              Laget for å være til å stole på
            </h2>
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

        {/* ===== Pris ===== */}
        <section id="pris" className="border-y border-linje bg-flate py-20" aria-labelledby="pris-tittel">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 id="pris-tittel" className="text-3xl font-bold sm:text-4xl">
              Én pris. Alt inkludert.
            </h2>
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

        {/* ===== FAQ ===== */}
        <section className="py-20" aria-labelledby="faq-tittel">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 id="faq-tittel" className="text-3xl font-bold sm:text-4xl">
              Vanlige spørsmål
            </h2>
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

        {/* ===== Slutt-CTA ===== */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-kort bg-primar px-6 py-14 text-center text-white shadow-svev">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Første steg tar under ett minutt
              </h2>
              <p className="mx-auto mt-3 max-w-md text-white/80">
                Opprett konto, last opp en kontoutskrift, og se hvor pengene dine faktisk går.
              </p>
              <Link
                href="/registrer"
                className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-primar-mork transition-colors hover:bg-primar-lys"
              >
                Prøv gratis i 14 dager
              </Link>
            </div>
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
