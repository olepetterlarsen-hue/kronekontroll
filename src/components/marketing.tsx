import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ lys = false }: { lys?: boolean }) {
  return (
    <Link
      href="/"
      className={`font-display text-xl font-bold tracking-tight ${lys ? "text-white" : "text-primar-mork"}`}
    >
      Krone<span className="text-aksent">kontroll</span>
    </Link>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-linje/60 bg-bakgrunn/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Hovedmeny" className="hidden items-center gap-6 text-sm font-medium text-demp sm:flex">
          <Link href="/#funksjoner" className="hover:text-blekk">Funksjoner</Link>
          <Link href="/#pris" className="hover:text-blekk">Pris</Link>
          <Link href="/guider" className="hover:text-blekk">Guider</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/logg-inn" className="text-sm font-semibold text-blekk hover:text-primar">
            Logg inn
          </Link>
          <Link
            href="/registrer"
            className="rounded-full bg-primar px-4 py-2 text-sm font-semibold text-white shadow-kort transition-colors hover:bg-primar-mork"
          >
            Prøv gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-linje bg-flate">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-demp">
              Norsk tjeneste for folk som vil ha kontroll på pengene sine. Dataene dine lagres i EU
              og deles aldri.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Lær mer</p>
            <ul className="mt-3 space-y-2 text-sm text-demp">
              <li><Link href="/guider" className="hover:text-primar">Alle guider</Link></li>
              <li><Link href="/guider/inkassovarsel-hva-gjor-jeg" className="hover:text-primar">Fått inkassovarsel?</Link></li>
              <li><Link href="/guider/budsjett-som-faktisk-fungerer" className="hover:text-primar">Budsjett som fungerer</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Om tjenesten</p>
            <ul className="mt-3 space-y-2 text-sm text-demp">
              <li><Link href="/personvern" className="hover:text-primar">Personvernerklæring</Link></li>
              <li><Link href="/vilkar" className="hover:text-primar">Vilkår</Link></li>
              <li><Link href="/angrerett" className="hover:text-primar">Angrerett</Link></li>
              <li><a href={`mailto:${site.supportEmail}`} className="hover:text-primar">{site.supportEmail}</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-linje pt-6 text-xs leading-relaxed text-demp">
          {site.disclaimer} © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
