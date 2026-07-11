/**
 * Oppretter demobruker med realistiske demodata.
 * Kjøring: node scripts/seed-demo.mjs (leser .env.local)
 * Trygt å kjøre flere ganger - eksisterende demobruker slettes og gjenskapes.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Les .env.local uten dotenv-avhengighet
for (const linje of readFileSync(".env.local", "utf8").split("\n")) {
  const m = linje.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const DEMO_EPOST = "demo@kronekontroll.no";
const DEMO_PASSORD = "RoIMagen-49kr";

// Slett eksisterende demobruker om den finnes
const { data: eksisterende } = await admin.auth.admin.listUsers({ perPage: 1000 });
const gammel = eksisterende?.users?.find((u) => u.email === DEMO_EPOST);
if (gammel) {
  await admin.auth.admin.deleteUser(gammel.id);
  console.log("Slettet gammel demobruker");
}

const { data: created, error } = await admin.auth.admin.createUser({
  email: DEMO_EPOST,
  password: DEMO_PASSORD,
  email_confirm: true,
  user_metadata: { full_name: "Demo Demosen" },
});
if (error) throw error;
const uid = created.user.id;
console.log("Demobruker opprettet:", uid);

const iDag = new Date();
const mnd = (dag) =>
  new Date(iDag.getFullYear(), iDag.getMonth(), dag).toISOString().slice(0, 10);
const omDager = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ---- Transaksjoner (denne måneden, inkl. gjentakende trekk) ----
const tx = [
  [1, "Lønn Arbeidsgiver AS", 34500, "inntekt", false],
  [1, "Husleie Utleier AS", -12500, "bolig", true],
  [2, "Strøm Tibber", -890, "bolig", true],
  [3, "Netflix", -139, "abonnementer", true],
  [3, "Spotify", -129, "abonnementer", true],
  [4, "SATS Trening", -659, "abonnementer", true],
  [4, "Storytel", -199, "abonnementer", true],
  [5, "iCloud+", -39, "abonnementer", true],
  [5, "Disney+", -119, "abonnementer", true],
  [6, "HBO Max", -129, "abonnementer", true],
  [2, "Rema 1000", -843, "dagligvarer", false],
  [5, "Kiwi", -412, "dagligvarer", false],
  [7, "Meny", -1268, "dagligvarer", false],
  [9, "Rema 1000", -654, "dagligvarer", false],
  [6, "Ruter månedskort", -853, "transport", true],
  [8, "Circle K", -742, "transport", false],
  [7, "Vipps - Deling middag", -420, "restaurant_uteliv", false],
  [8, "Peppes Pizza", -389, "restaurant_uteliv", false],
  [9, "Zalando", -1249, "shopping", false],
  [3, "Apotek 1", -256, "helse", false],
  [4, "If Forsikring", -1120, "forsikring", true],
  [10, "Bank Norwegian avdrag", -2450, "gjeld_renter", true],
  [10, "Overføring sparekonto", -1500, "sparing", true],
];
await insert("transactions", tx.map(([dag, beskrivelse, belop, kategori, fast]) => ({
  user_id: uid,
  tx_date: mnd(dag),
  description: beskrivelse,
  amount: belop,
  category: kategori,
  is_recurring: fast,
})));

// ---- Gjeld ----
await insert("debts", [
  { user_id: uid, creditor: "Bank Norwegian", debt_type: "forbrukslaan", principal: 85000, interest_rate: 17.9, monthly_payment: 2450 },
  { user_id: uid, creditor: "Ikano Kredittkort", debt_type: "kredittkort", principal: 23400, interest_rate: 24.9, monthly_payment: 800 },
  { user_id: uid, creditor: "Santander Billån", debt_type: "billaan", principal: 142000, interest_rate: 6.9, monthly_payment: 3100 },
]);

// ---- Inkassokrav med kontrollfunn (samme logikk som lib/config/inkasso.ts) ----
await insert("inkasso_claims", [
  {
    user_id: uid,
    creditor: "Treningssenteret AS",
    collector: "Inkassopartner AS",
    original_amount: 1890,
    purregebyr: 70,
    salaer: 1210,
    renter: 46,
    total_amount: 3216,
    deadline: omDager(12),
    stage: "inkassovarsel",
    flags: [
      { kode: "hoyt_purregebyr", tekst: "Purregebyret (70 kr) er høyere enn maksgebyret på 35 kr per purring. Sjekk om det er lagt på flere gebyrer enn tillatt." },
      { kode: "hoyt_salaer", tekst: "Inkassosalæret (1210 kr) er høyt i forhold til hovedkravet (1890 kr). Maksimalsatsene er regulert i inkassoforskriften - dette bør du få sjekket eller bestride." },
    ],
  },
]);

// ---- Oppgaver ----
await insert("tasks", [
  { user_id: uid, title: "Svar på inkassovarsel fra Treningssenteret AS", description: "Inkassokontrollen fant 2 avvik du bør vurdere. Se gjeldsmodulen.", due_date: omDager(12), source: "inkasso" },
  { user_id: uid, title: "Send oppsigelse til Storytel", description: "Du har ikke brukt tjenesten på 3 måneder. Utkast ligger klart i e-postverkstedet.", due_date: omDager(5), source: "manuell" },
  { user_id: uid, title: "Be banken om lavere rente på forbrukslånet", description: "Renteradaren viser 17,9 % mot veiledende 12 %.", due_date: omDager(20), source: "gjeld" },
]);

// ---- Sparemål ----
await insert("savings_goals", [
  { user_id: uid, name: "Buffer", target_amount: 30000, saved_amount: 20400, target_date: omDager(180) },
  { user_id: uid, name: "Sommerferie", target_amount: 15000, saved_amount: 3200, target_date: omDager(330) },
]);

// ---- Eksempel-utkast i e-postverkstedet ----
await insert("email_drafts", [
  {
    user_id: uid,
    template_type: "oppsigelse_abonnement",
    subject: "Oppsigelse av abonnement",
    body: `Hei,

Jeg ønsker å si opp mitt abonnement hos dere med virkning fra førstkommende fornyelse.

Jeg ber om skriftlig bekreftelse på at oppsigelsen er registrert, hvilken dato abonnementet løper til, og at det ikke vil skje flere trekk fra min konto etter denne datoen.

Med vennlig hilsen
Demo Demosen`,
  },
]);

async function insert(tabell, rader) {
  const { error } = await admin.from(tabell).insert(rader);
  if (error) throw new Error(`${tabell}: ${error.message}`);
  console.log(`Seedet ${tabell} (${rader.length})`);
}

console.log("\nFerdig!");
console.log(`  E-post:  ${DEMO_EPOST}`);
console.log(`  Passord: ${DEMO_PASSORD}`);
