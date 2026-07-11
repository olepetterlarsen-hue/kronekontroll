"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

/** Server actions for gjeldsmodulen. RLS sikrer eierskap på alle spørringer. */

export async function fullforOppgave(oppgaveId: string) {
  const { user, supabase } = await requireUser();
  await supabase
    .from("tasks")
    .update({ status: "fullfort" })
    .eq("id", oppgaveId)
    .eq("user_id", user.id);
  revalidatePath("/app/gjeld");
  revalidatePath("/app");
}

const GjeldInput = z.object({
  creditor: z.string().min(1).max(200),
  debt_type: z.enum(["forbrukslaan", "kredittkort", "boliglaan", "billaan", "inkasso", "annet"]),
  principal: z.coerce.number().positive().max(100_000_000),
  interest_rate: z.coerce.number().min(0).max(100).optional(),
  monthly_payment: z.coerce.number().min(0).max(10_000_000).optional(),
});

export async function leggTilGjeld(formData: FormData): Promise<{ feil?: string }> {
  const { user, supabase } = await requireUser();

  const input = GjeldInput.safeParse({
    creditor: formData.get("creditor"),
    debt_type: formData.get("debt_type"),
    principal: formData.get("principal"),
    interest_rate: formData.get("interest_rate") || undefined,
    monthly_payment: formData.get("monthly_payment") || undefined,
  });
  if (!input.success) return { feil: "Sjekk feltene - kreditor og beløp må fylles ut." };

  const { error } = await supabase.from("debts").insert({ user_id: user.id, ...input.data });
  if (error) return { feil: "Kunne ikke lagre gjelden." };

  revalidatePath("/app/gjeld");
  revalidatePath("/app");
  return {};
}

export async function markerGjeldNedbetalt(gjeldId: string) {
  const { user, supabase } = await requireUser();
  await supabase
    .from("debts")
    .update({ status: "nedbetalt" })
    .eq("id", gjeldId)
    .eq("user_id", user.id);
  revalidatePath("/app/gjeld");
  revalidatePath("/app");
}

export async function markerInkassoLost(kravId: string) {
  const { user, supabase } = await requireUser();
  await supabase
    .from("inkasso_claims")
    .update({ resolved: true })
    .eq("id", kravId)
    .eq("user_id", user.id);
  revalidatePath("/app/gjeld");
}
