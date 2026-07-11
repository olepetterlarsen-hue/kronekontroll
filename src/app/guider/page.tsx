import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing";
import { guides } from "@/content/guider";
import { datoKort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Guider om budsjett, gjeld og sparing",
  description:
    "Praktiske guider på norsk: budsjett som fungerer, hva du gjør ved inkassovarsel, nedbetaling av gjeld, oppsigelse av abonnementer og renteforhandling.",
  alternates: { canonical: "/guider" },
};

export default function GuiderIndex() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold">Guider</h1>
        <p className="mt-3 max-w-xl text-demp">
          Konkrete, praktiske guider om privatøkonomi. Ingen sjargong, ingen pekefinger.
        </p>
        <div className="mt-10 space-y-5">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guider/${g.slug}`}
              className="block rounded-kort border border-linje bg-flate p-6 shadow-kort transition-shadow hover:shadow-svev"
            >
              <p className="text-xs font-semibold text-demp">
                {datoKort(g.publishedAt)} · {g.readingMinutes} min lesing
              </p>
              <h2 className="mt-2 text-xl font-semibold text-blekk">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-demp">{g.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
