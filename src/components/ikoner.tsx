/**
 * Feature-ikoner. Designet i Figma (Kronekontroll - brand assets) og gjenskapt
 * som inline-SVG: skarpe i alle størrelser, ingen ekstra nettverkskall, og
 * fargene følger paletten i globals.css.
 */

const PRIMAR = "var(--color-primar)";
const PRIMAR_LYS = "var(--color-primar-lys)";
const AKSENT = "var(--color-aksent)";
const POSITIV = "var(--color-positiv)";
const HVIT = "var(--color-flate)";

function Ramme({ children, tittel }: { children: React.ReactNode; tittel: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width="48"
      height="48"
      role="img"
      aria-label={tittel}
      className="shrink-0"
    >
      <rect width="96" height="96" rx="24" fill={PRIMAR_LYS} />
      {children}
    </svg>
  );
}

export function IkonImport() {
  return (
    <Ramme tittel="Importer dokumenter">
      <rect x="24" y="56" width="48" height="16" rx="6" fill={PRIMAR} />
      <rect x="44" y="20" width="8" height="24" rx="4" fill={PRIMAR} />
      <path d="M36 44 h24 l-12 14 z" fill={PRIMAR} />
    </Ramme>
  );
}

export function IkonRadar() {
  return (
    <Ramme tittel="Renteradar">
      <circle cx="48" cy="48" r="27" fill="none" stroke={PRIMAR} strokeWidth="4" />
      <circle cx="48" cy="48" r="15" fill="none" stroke={PRIMAR} strokeWidth="3" />
      <circle cx="63" cy="37" r="8" fill={AKSENT} />
    </Ramme>
  );
}

export function IkonSkjold() {
  return (
    <Ramme tittel="Inkassokontroll">
      <path d="M48 18 L74 28 v20 c0 16 -12 26 -26 32 C34 74 22 64 22 48 V28 Z" fill={PRIMAR} />
      <path
        d="M38 48 l8 8 14 -16"
        fill="none"
        stroke={HVIT}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Ramme>
  );
}

export function IkonEpost() {
  return (
    <Ramme tittel="E-postverksted">
      <rect x="20" y="30" width="56" height="38" rx="8" fill={PRIMAR} />
      <path d="M24 34 L48 54 L72 34" fill="none" stroke={PRIMAR_LYS} strokeWidth="5" strokeLinejoin="round" />
    </Ramme>
  );
}

export function IkonSparemaal() {
  return (
    <Ramme tittel="Sparemål">
      <circle cx="48" cy="48" r="28" fill={POSITIV} />
      <circle cx="48" cy="48" r="17" fill={PRIMAR_LYS} />
      <circle cx="48" cy="48" r="7" fill={AKSENT} />
    </Ramme>
  );
}

export function IkonVarsel() {
  return (
    <Ramme tittel="Varsler">
      <path d="M30 58 v-14 a18 18 0 0 1 36 0 v14 z" fill={PRIMAR} />
      <rect x="24" y="58" width="48" height="7" rx="3.5" fill={PRIMAR} />
      <circle cx="48" cy="71" r="6" fill={AKSENT} />
    </Ramme>
  );
}
