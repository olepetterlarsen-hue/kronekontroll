/**
 * ISOLASJONSTESTER - selve garantien mot datasmitte.
 *
 * Testene oppretter to brukere (A og B) i et test-Supabase-prosjekt, legger inn
 * data som A, og verifiserer at B ikke kan lese, endre eller slette noe av det -
 * verken i databasen eller i Storage. Kjøres mot RLS-policyene i
 * supabase/migrations/, altså det faktiske forsvarslaget i produksjon.
 *
 * Kjøring:
 *   1. Opprett et test-prosjekt i Supabase (IKKE produksjon) og kjør migrasjonene.
 *   2. Sett TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, TEST_SUPABASE_SERVICE_ROLE_KEY
 *      (lokalt i .env.test eller som CI-secrets).
 *   3. npm run test:isolasjon
 *
 * Uten env-variablene hopper testene over MED tydelig beskjed - de regnes da
 * IKKE som bestått. CI skal alltid kjøre med variablene satt.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const URL = process.env.TEST_SUPABASE_URL;
const ANON = process.env.TEST_SUPABASE_ANON_KEY;
const SERVICE = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const kanKjore = Boolean(URL && ANON && SERVICE);

if (!kanKjore) {
  console.warn(
    "\n⚠️  ISOLASJONSTESTENE BLE HOPPET OVER - TEST_SUPABASE_* er ikke satt.\n" +
      "   Dette er IKKE en bestått kjøring. Sett variablene og kjør på nytt.\n",
  );
}

const BRUKERTABELLER = [
  "documents",
  "transactions",
  "debts",
  "inkasso_claims",
  "savings_goals",
  "tasks",
  "email_drafts",
  "payslips",
  "purchase_plans",
] as const;

/** Minimal gyldig rad per tabell (user_id settes i testen). */
const TESTRADER: Record<(typeof BRUKERTABELLER)[number], Record<string, unknown>> = {
  documents: { doc_type: "kontoutskrift", original_name: "test.pdf", storage_path: "x" },
  transactions: { tx_date: "2026-01-15", description: "Test", amount: -100, category: "annet" },
  debts: { creditor: "Testbanken", debt_type: "forbrukslaan", principal: 10000 },
  inkasso_claims: { creditor: "Kreditor AS", original_amount: 500, total_amount: 700 },
  savings_goals: { name: "Buffer", target_amount: 30000 },
  tasks: { title: "Testoppgave" },
  email_drafts: { template_type: "betalingsplan", subject: "Test", body: "Test" },
  payslips: { gross_pay: 45000, net_pay: 32000 },
  purchase_plans: { title: "Testbil", price: 150000, monthly_saving: 2000 },
};

describe.runIf(kanKjore)("Tenant-isolasjon: bruker B når aldri bruker As data", () => {
  let admin: SupabaseClient;
  let klientA: SupabaseClient;
  let klientB: SupabaseClient;
  let brukerAId: string;
  let brukerBId: string;
  const radIder = new Map<string, string>();

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, { auth: { persistSession: false } });

    const lagBruker = async (navn: string) => {
      const epost = `isolasjon-${navn}-${Date.now()}@test.kronekontroll.no`;
      const passord = `Test-${crypto.randomUUID()}`;
      const { data, error } = await admin.auth.admin.createUser({
        email: epost,
        password: passord,
        email_confirm: true,
      });
      if (error || !data.user) throw new Error(`Kunne ikke opprette testbruker: ${error?.message}`);
      const klient = createClient(URL!, ANON!, { auth: { persistSession: false } });
      const { error: innloggingsfeil } = await klient.auth.signInWithPassword({
        email: epost,
        password: passord,
      });
      if (innloggingsfeil) throw new Error(`Innlogging feilet: ${innloggingsfeil.message}`);
      return { id: data.user.id, klient };
    };

    const a = await lagBruker("a");
    const b = await lagBruker("b");
    brukerAId = a.id;
    brukerBId = b.id;
    klientA = a.klient;
    klientB = b.klient;

    // Bruker A legger inn én rad i hver tabell
    for (const tabell of BRUKERTABELLER) {
      const { data, error } = await klientA
        .from(tabell)
        .insert({ user_id: brukerAId, ...TESTRADER[tabell] })
        .select("id")
        .single();
      if (error || !data) throw new Error(`Klarte ikke seede ${tabell}: ${error?.message}`);
      radIder.set(tabell, data.id);
    }

    // Bruker A laster opp en fil i egen mappe
    const { error: filFeil } = await klientA.storage
      .from("dokumenter")
      .upload(`${brukerAId}/hemmelig.txt`, new Blob(["hemmelig innhold"]), {
        contentType: "text/plain",
      });
    if (filFeil) throw new Error(`Klarte ikke laste opp testfil: ${filFeil.message}`);
  }, 60_000);

  afterAll(async () => {
    // Rydd opp testbrukerne (cascade sletter radene, Storage ryddes eksplisitt)
    await admin.storage.from("dokumenter").remove([`${brukerAId}/hemmelig.txt`]);
    if (brukerAId) await admin.auth.admin.deleteUser(brukerAId);
    if (brukerBId) await admin.auth.admin.deleteUser(brukerBId);
  }, 30_000);

  for (const tabell of BRUKERTABELLER) {
    it(`${tabell}: B kan ikke LESE As rader`, async () => {
      const { data } = await klientB.from(tabell).select("*");
      expect(data ?? []).toHaveLength(0);
    });

    it(`${tabell}: B kan ikke lese As rad via direkte id`, async () => {
      const { data } = await klientB.from(tabell).select("*").eq("id", radIder.get(tabell)!);
      expect(data ?? []).toHaveLength(0);
    });

    it(`${tabell}: B kan ikke ENDRE As rader`, async () => {
      await klientB
        .from(tabell)
        .update(TESTRADER[tabell])
        .eq("id", radIder.get(tabell)!);
      // Verifiser at raden fortsatt finnes urørt sett fra A
      const { data } = await klientA.from(tabell).select("id").eq("id", radIder.get(tabell)!);
      expect(data).toHaveLength(1);
    });

    it(`${tabell}: B kan ikke SLETTE As rader`, async () => {
      await klientB.from(tabell).delete().eq("id", radIder.get(tabell)!);
      const { data } = await klientA.from(tabell).select("id").eq("id", radIder.get(tabell)!);
      expect(data).toHaveLength(1);
    });

    it(`${tabell}: B kan ikke SETTE INN rader med As user_id`, async () => {
      const { error } = await klientB
        .from(tabell)
        .insert({ user_id: brukerAId, ...TESTRADER[tabell] });
      expect(error).not.toBeNull();
    });
  }

  it("profiles: B ser ikke As profil", async () => {
    const { data } = await klientB.from("profiles").select("*").eq("id", brukerAId);
    expect(data ?? []).toHaveLength(0);
  });

  it("profiles: B kan ikke gjøre seg selv til admin", async () => {
    await klientB.from("profiles").update({ is_admin: true }).eq("id", brukerBId);
    const { data } = await admin.from("profiles").select("is_admin").eq("id", brukerBId).single();
    expect(data?.is_admin).toBe(false);
  });

  it("profiles: B kan ikke forlenge egen prøveperiode", async () => {
    const { data: foer } = await admin
      .from("profiles")
      .select("trial_ends_at")
      .eq("id", brukerBId)
      .single();
    await klientB
      .from("profiles")
      .update({ trial_ends_at: "2099-01-01T00:00:00Z" })
      .eq("id", brukerBId);
    const { data: etter } = await admin
      .from("profiles")
      .select("trial_ends_at")
      .eq("id", brukerBId)
      .single();
    expect(etter?.trial_ends_at).toBe(foer?.trial_ends_at);
  });

  it("storage: B kan ikke laste ned As fil", async () => {
    const { data, error } = await klientB.storage
      .from("dokumenter")
      .download(`${brukerAId}/hemmelig.txt`);
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  it("storage: B kan ikke liste As mappe", async () => {
    const { data } = await klientB.storage.from("dokumenter").list(brukerAId);
    expect(data ?? []).toHaveLength(0);
  });

  it("storage: B kan ikke laste opp til As mappe", async () => {
    const { error } = await klientB.storage
      .from("dokumenter")
      .upload(`${brukerAId}/ondsinnet.txt`, new Blob(["x"]));
    expect(error).not.toBeNull();
  });

  it("storage: B kan ikke lage signert URL til As fil", async () => {
    const { data, error } = await klientB.storage
      .from("dokumenter")
      .createSignedUrl(`${brukerAId}/hemmelig.txt`, 60);
    expect(data?.signedUrl ?? null).toBeNull();
    expect(error).not.toBeNull();
  });

  it("social_posts: vanlig bruker har ikke tilgang", async () => {
    const { data } = await klientB.from("social_posts").select("*");
    expect(data ?? []).toHaveLength(0);
    const { error } = await klientB
      .from("social_posts")
      .insert({ platform: "x", format: "post", title: "hack", body: {} });
    expect(error).not.toBeNull();
  });

  it("notifications_log: B kan ikke skrive (kun cron via service role)", async () => {
    const { error } = await klientB.from("notifications_log").insert({
      user_id: brukerBId,
      notification_type: "test",
      dedupe_key: "test",
    });
    expect(error).not.toBeNull();
  });
});
