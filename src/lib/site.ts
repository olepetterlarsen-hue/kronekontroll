export const site = {
  name: "Kronekontroll",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kronekontroll.no",
  description:
    "Kronekontroll hjelper deg å bruke pengene riktig: se hvor det lekker, stopp gjeld i tide og nå sparemålene dine. Norsk tjeneste, 49 kr/mnd.",
  priceNokPerMonth: 49,
  trialDays: 14,
  supportEmail: "hjelp@kronekontroll.no",
  senderEmail: "varsel@kronekontroll.no",
  /**
   * Juridisk ramme: Kronekontroll er programvare og verktøy, ikke gjeldsmegler
   * eller finansrådgiver. Denne teksten vises i footer og i gjeldsmodulen.
   */
  disclaimer:
    "Kronekontroll gir generell veiledning og verktøy, ikke individuell finansiell eller juridisk rådgivning. Alt du sender til kreditorer, sender du selv.",
} as const;
