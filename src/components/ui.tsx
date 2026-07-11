import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Små, gjenbrukbare byggeklosser. Alle farger kommer fra designsystemet i globals.css. */

export function Knapp({
  variant = "primar",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primar" | "sekundar" | "fare" }) {
  const stiler = {
    primar:
      "bg-primar text-white hover:bg-primar-mork shadow-kort",
    sekundar:
      "bg-flate text-blekk border border-linje hover:border-primar hover:text-primar",
    fare: "bg-negativ-lys text-negativ border border-negativ/20 hover:bg-negativ hover:text-white",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${stiler} ${className}`}
      {...props}
    />
  );
}

export function KnappLenke({
  href,
  variant = "primar",
  className = "",
  children,
}: {
  href: string;
  variant?: "primar" | "sekundar";
  className?: string;
  children: ReactNode;
}) {
  const stiler = {
    primar: "bg-primar text-white hover:bg-primar-mork shadow-kort",
    sekundar: "bg-flate text-blekk border border-linje hover:border-primar hover:text-primar",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${stiler} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Kort({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bg-flate border border-linje rounded-kort shadow-kort p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Etikett({
  tone = "noytral",
  children,
}: {
  tone?: "noytral" | "positiv" | "varsel" | "negativ" | "primar";
  children: ReactNode;
}) {
  const stiler = {
    noytral: "bg-flate-demp text-demp",
    positiv: "bg-positiv-lys text-positiv",
    varsel: "bg-varsel-lys text-varsel",
    negativ: "bg-negativ-lys text-negativ",
    primar: "bg-primar-lys text-primar-mork",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stiler}`}>
      {children}
    </span>
  );
}

export function Felt({
  label,
  id,
  hjelpetekst,
  children,
}: {
  label: string;
  id: string;
  hjelpetekst?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-blekk">
        {label}
      </label>
      {children}
      {hjelpetekst ? <p className="text-xs text-demp">{hjelpetekst}</p> : null}
    </div>
  );
}

export const inputKlasse =
  "w-full rounded-xl border border-linje bg-flate px-3.5 py-2.5 text-sm text-blekk placeholder:text-demp/60 focus:border-primar focus:outline-none focus:ring-2 focus:ring-primar/20";

export function StatKort({
  tittel,
  verdi,
  under,
  tone = "noytral",
}: {
  tittel: string;
  verdi: string;
  under?: string;
  tone?: "noytral" | "positiv" | "negativ";
}) {
  const verdiFarge = { noytral: "text-blekk", positiv: "text-positiv", negativ: "text-negativ" }[tone];
  return (
    <Kort className="ktr-inn">
      <p className="text-xs font-semibold uppercase tracking-wide text-demp">{tittel}</p>
      <p className={`mt-2 text-3xl font-bold font-display tabular-nums ${verdiFarge}`}>{verdi}</p>
      {under ? <p className="mt-1 text-xs text-demp">{under}</p> : null}
    </Kort>
  );
}

export function TomTilstand({
  tittel,
  tekst,
  handling,
}: {
  tittel: string;
  tekst: string;
  handling?: ReactNode;
}) {
  return (
    <Kort className="text-center py-12">
      <h3 className="text-lg font-semibold">{tittel}</h3>
      <p className="mt-2 text-sm text-demp max-w-md mx-auto">{tekst}</p>
      {handling ? <div className="mt-5 flex justify-center">{handling}</div> : null}
    </Kort>
  );
}
