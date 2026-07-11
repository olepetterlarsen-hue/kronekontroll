/** Transaksjonskategorier. AI-parseren instrueres til å bruke kun disse. */
export const KATEGORIER = [
  "bolig",
  "dagligvarer",
  "transport",
  "abonnementer",
  "restaurant_uteliv",
  "shopping",
  "helse",
  "barn_familie",
  "gjeld_renter",
  "sparing",
  "forsikring",
  "inntekt",
  "annet",
] as const;

export type Kategori = (typeof KATEGORIER)[number];

export const KATEGORI_NAVN: Record<Kategori, string> = {
  bolig: "Bolig",
  dagligvarer: "Dagligvarer",
  transport: "Transport",
  abonnementer: "Abonnementer",
  restaurant_uteliv: "Restaurant og uteliv",
  shopping: "Shopping",
  helse: "Helse",
  barn_familie: "Barn og familie",
  gjeld_renter: "Gjeld og renter",
  sparing: "Sparing",
  forsikring: "Forsikring",
  inntekt: "Inntekt",
  annet: "Annet",
};
