import type { ReactNode } from "react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing";

export function JusSide({
  tittel,
  oppdatert,
  children,
}: {
  tittel: string;
  oppdatert: string;
  children: ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{tittel}</h1>
        <p className="mt-2 text-sm text-demp">Sist oppdatert {oppdatert}</p>
        <div className="mt-8 space-y-6">{children}</div>
      </main>
      <MarketingFooter />
    </>
  );
}

export function Avsnitt({ tittel, children }: { tittel: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{tittel}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-blekk/90">{children}</div>
    </section>
  );
}
