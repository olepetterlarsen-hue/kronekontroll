import { NextRequest } from "next/server";
import { fristVarselHtml, sendVarsel, sparemaalHtml } from "@/lib/epost";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 300;

/**
 * Daglig varselsjobb (Vercel Cron, se vercel.json).
 * SIKKERHET: krever CRON_SECRET som Bearer-token før noe kjøres.
 * IDEMPOTENS: hvert varsel skrives til notifications_log med unik dedupe_key,
 * så en re-kjøring samme dag sender aldri dobbelt.
 */
export async function GET(request: NextRequest) {
  // Defensivt: mangler hemmeligheten i miljøet skal svaret være 401, ikke 500
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const iDag = new Date().toISOString().slice(0, 10);
  let sendt = 0;

  // ---- Fristvarsler: 7 dager og 1 dag før ----
  for (const dager of [7, 1]) {
    const mål = new Date();
    mål.setDate(mål.getDate() + dager);
    const målDato = mål.toISOString().slice(0, 10);

    const { data: oppgaver } = await admin
      .from("tasks")
      .select("id, user_id, title, due_date")
      .eq("status", "aapen")
      .eq("due_date", målDato);

    for (const oppgave of oppgaver ?? []) {
      const dedupeKey = `frist:${oppgave.id}:${dager}d`;
      const ok = await loggFørSending(admin, oppgave.user_id, "fristvarsel", oppgave.id, dedupeKey);
      if (!ok) continue;

      const mottaker = await hentMottaker(admin, oppgave.user_id, "task_reminders");
      if (!mottaker) continue;

      await sendVarsel({
        til: mottaker,
        emne:
          dager === 1
            ? `Frist i morgen: ${oppgave.title}`
            : `Frist om ${dager} dager: ${oppgave.title}`,
        htmlInnhold: fristVarselHtml(oppgave, dager),
        kanAvmeldes: true,
      });
      sendt++;
    }
  }

  // ---- Sparemål-milepæler (50 % og 100 %) ----
  const { data: mål } = await admin
    .from("savings_goals")
    .select("id, user_id, name, target_amount, saved_amount, completed_at")
    .is("completed_at", null);

  for (const m of mål ?? []) {
    const prosent = m.target_amount > 0 ? Math.floor((m.saved_amount / m.target_amount) * 100) : 0;
    const milepæl = prosent >= 100 ? 100 : prosent >= 50 ? 50 : null;
    if (!milepæl) continue;

    const dedupeKey = `sparemaal:${m.id}:${milepæl}`;
    const ok = await loggFørSending(admin, m.user_id, "sparemaal_milepael", m.id, dedupeKey);
    if (!ok) continue;

    const mottaker = await hentMottaker(admin, m.user_id, "savings_milestones");
    if (!mottaker) continue;

    await sendVarsel({
      til: mottaker,
      emne: milepæl >= 100 ? `Sparemål nådd: ${m.name}` : `${Math.min(prosent, 99)} % av veien til ${m.name}!`,
      htmlInnhold: sparemaalHtml(m.name, Math.min(prosent, 100)),
      kanAvmeldes: true,
    });
    if (milepæl >= 100) {
      await admin
        .from("savings_goals")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", m.id);
    }
    sendt++;
  }

  return Response.json({ ok: true, dato: iDag, varslerSendt: sendt });
}

/** Returnerer e-postadresse hvis brukeren har varslingstypen på, ellers null. */
async function hentMottaker(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  innstilling: "task_reminders" | "weekly_summary" | "savings_milestones",
): Promise<string | null> {
  const { data: settings } = await admin
    .from("notification_settings")
    .select(innstilling)
    .eq("user_id", userId)
    .single();
  if (!settings || !(settings as Record<string, boolean>)[innstilling]) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  return profile?.email ?? null;
}

/** Skriver dedupe-rad FØR utsending. Returnerer false hvis varselet alt er sendt. */
async function loggFørSending(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  type: string,
  refId: string,
  dedupeKey: string,
): Promise<boolean> {
  const { error } = await admin.from("notifications_log").insert({
    user_id: userId,
    notification_type: type,
    ref_id: refId,
    dedupe_key: dedupeKey,
  });
  return !error; // unique constraint bryter ved duplikat
}
