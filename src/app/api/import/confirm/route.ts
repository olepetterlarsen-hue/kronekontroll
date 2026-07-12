import { NextRequest } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { kontrollerInkassokrav } from "@/lib/config/inkasso";
import {
  EpostSchema,
  InkassoSchema,
  KontoutskriftSchema,
  LaanSchema,
  LonnsslippSchema,
} from "@/lib/schemas";

const ConfirmInput = z.object({ documentId: z.string().uuid() });

/**
 * Brukeren har sett gjennom tolkningen og bekrefter. Nå materialiseres
 * dataene til riktige tabeller. Alt skjer via brukerens egen klient (RLS).
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireUser();

    const body = ConfirmInput.safeParse(await request.json());
    if (!body.success) return Response.json({ error: "Ugyldig forespørsel" }, { status: 400 });

    // RLS sikrer at dokumentet tilhører brukeren; .eq("user_id") er belt-and-suspenders
    const { data: doc } = await supabase
      .from("documents")
      .select("id, doc_type, status, parsed")
      .eq("id", body.data.documentId)
      .eq("user_id", user.id)
      .single();

    if (!doc || doc.status !== "tolket" || !doc.parsed) {
      return Response.json({ error: "Fant ikke et tolket dokument å bekrefte" }, { status: 404 });
    }

    if (doc.doc_type === "kontoutskrift") {
      const parsed = KontoutskriftSchema.parse(doc.parsed);
      if (parsed.transaksjoner.length > 0) {
        const { error } = await supabase.from("transactions").insert(
          parsed.transaksjoner.map((t) => ({
            user_id: user.id,
            document_id: doc.id,
            tx_date: t.dato,
            description: t.beskrivelse,
            amount: t.belop,
            category: t.kategori,
            is_recurring: t.erGjentakende,
          })),
        );
        if (error) return Response.json({ error: "Kunne ikke lagre transaksjoner" }, { status: 500 });
      }
    } else if (doc.doc_type === "inkasso") {
      const parsed = InkassoSchema.parse(doc.parsed);
      const flagg = kontrollerInkassokrav({
        hovedkrav: parsed.hovedkrav,
        purregebyr: parsed.purregebyr,
        salaer: parsed.salaer,
        renter: parsed.renter,
        totalkrav: parsed.totalkrav,
      });
      const { error } = await supabase.from("inkasso_claims").insert({
        user_id: user.id,
        document_id: doc.id,
        creditor: parsed.kreditor,
        collector: parsed.inkassoselskap,
        original_amount: parsed.hovedkrav,
        purregebyr: parsed.purregebyr,
        salaer: parsed.salaer,
        renter: parsed.renter,
        total_amount: parsed.totalkrav,
        deadline: parsed.betalingsfrist,
        stage: parsed.stadium,
        flags: flagg,
      });
      if (error) return Response.json({ error: "Kunne ikke lagre inkassokravet" }, { status: 500 });

      // Frist blir automatisk en oppgave
      if (parsed.betalingsfrist) {
        await supabase.from("tasks").insert({
          user_id: user.id,
          title: `Svar på ${parsed.stadium} fra ${parsed.kreditor}`,
          description:
            flagg.length > 0
              ? `Inkassokontrollen fant ${flagg.length} avvik du bør vurdere. Se gjeldsmodulen.`
              : "Betal eller bestrid kravet innen fristen.",
          due_date: parsed.betalingsfrist,
          source: "inkasso",
        });
      }
    } else if (doc.doc_type === "laan") {
      const parsed = LaanSchema.parse(doc.parsed);
      const { error } = await supabase.from("debts").insert({
        user_id: user.id,
        source_document_id: doc.id,
        creditor: parsed.langiver,
        debt_type: parsed.laanetype,
        principal: parsed.hovedstol,
        interest_rate: parsed.nominellRente,
        monthly_payment: parsed.terminbelop,
      });
      if (error) return Response.json({ error: "Kunne ikke lagre lånet" }, { status: 500 });
    } else if (doc.doc_type === "lonnsslipp") {
      const parsed = LonnsslippSchema.parse(doc.parsed);
      const { error } = await supabase.from("payslips").insert({
        user_id: user.id,
        document_id: doc.id,
        employer: parsed.arbeidsgiver,
        period: parsed.periode,
        gross_pay: parsed.bruttolonn,
        net_pay: parsed.nettoUtbetalt,
        tax_withheld: parsed.skattetrekk,
      });
      if (error) return Response.json({ error: "Kunne ikke lagre lønnsslippen" }, { status: 500 });
    } else if (doc.doc_type === "epost") {
      const parsed = EpostSchema.parse(doc.parsed);
      if (parsed.foreslattOppgave) {
        await supabase.from("tasks").insert({
          user_id: user.id,
          title: parsed.foreslattOppgave,
          description: parsed.sammendrag,
          due_date: parsed.frist,
          source: "import",
        });
      }
    }

    await supabase.from("documents").update({ status: "bekreftet" }).eq("id", doc.id);
    return Response.json({ ok: true });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
