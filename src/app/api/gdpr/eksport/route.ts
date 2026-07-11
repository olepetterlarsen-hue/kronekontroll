import { authErrorResponse, requireUser } from "@/lib/auth";

/**
 * GDPR innsynsrett: selvbetjent eksport av alle egne data som JSON.
 * Kjøres med brukerens egen klient - RLS garanterer at kun egne rader hentes.
 */
export async function GET() {
  try {
    const { user, supabase } = await requireUser();

    const tabeller = [
      "profiles",
      "documents",
      "transactions",
      "debts",
      "inkasso_claims",
      "savings_goals",
      "tasks",
      "email_drafts",
      "notification_settings",
      "notifications_log",
    ] as const;

    const eksport: Record<string, unknown> = {
      eksportertAv: user.id,
      eksportertDato: new Date().toISOString(),
    };

    for (const tabell of tabeller) {
      const kolonne = tabell === "profiles" ? "id" : "user_id";
      const { data } = await supabase.from(tabell).select("*").eq(kolonne, user.id);
      eksport[tabell] = data ?? [];
    }

    return new Response(JSON.stringify(eksport, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kronekontroll-eksport-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Kunne ikke eksportere data" }, { status: 500 });
  }
}
