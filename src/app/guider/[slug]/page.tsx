import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingFooter, MarketingHeader } from "@/components/marketing";
import { guides } from "@/content/guider";
import { datoKort } from "@/lib/format";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guider/${guide.slug}` },
    openGraph: { type: "article", publishedTime: guide.publishedAt },
  };
}

export default async function GuideSide({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <article>
          <p className="text-xs font-semibold text-demp">
            <Link href="/guider" className="text-primar hover:underline">
              Guider
            </Link>{" "}
            · {datoKort(guide.publishedAt)} · {guide.readingMinutes} min lesing
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{guide.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-demp">{guide.intro}</p>

          {guide.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-2xl font-semibold">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-blekk/90">
                  {p}
                </p>
              ))}
              {s.list ? (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-blekk/90">
                  {s.list.map((punkt, i) => (
                    <li key={i} className="leading-relaxed">
                      {punkt}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <aside className="mt-14 rounded-kort bg-primar-lys p-8">
            <h2 className="text-xl font-semibold text-primar-mork">
              La Kronekontroll gjøre jobben
            </h2>
            <p className="mt-2 leading-relaxed text-blekk/80">{guide.cta}</p>
            <Link
              href="/registrer"
              className="mt-5 inline-block rounded-full bg-primar px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primar-mork"
            >
              Prøv gratis i 14 dager
            </Link>
          </aside>
        </article>
      </main>
      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            datePublished: guide.publishedAt,
            inLanguage: "nb",
            author: { "@type": "Organization", name: site.name, url: site.url },
            publisher: { "@type": "Organization", name: site.name },
            mainEntityOfPage: `${site.url}/guider/${guide.slug}`,
          }),
        }}
      />
    </>
  );
}
