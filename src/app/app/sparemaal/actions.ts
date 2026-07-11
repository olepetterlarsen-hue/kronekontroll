"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const MålInput = z.object({
  name: z.string().min(1).max(120),
  target_amount: z.coerce.number().positive().max(100_000_000),
  target_date: z.string().optional(),
});

export async function opprettMaal(formData: FormData): Promise<{ feil?: string }> {
  const { user, supabase } = await requireUser();
  const input = MålInput.safeParse({
    name: formData.get("name"),
    target_amount: formData.get("target_amount"),
    target_date: formData.get("target_date") || undefined,
  });
  if (!input.success) return { feil: "Gi målet et navn og et beløp." };

  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name: input.data.name,
    target_amount: input.data.target_amount,
    target_date: input.data.target_date ?? null,
  });
  if (error) return { feil: "Kunne ikke lagre målet." };
  revalidatePath("/app/sparemaal");
  revalidatePath("/app");
  return {};
}

const OppdaterInput = z.object({
  id: z.string().uuid(),
  saved_amount: z.coerce.number().min(0).max(100_000_000),
});

export async function oppdaterSpart(formData: FormData): Promise<{ feil?: string }> {
  const { user, supabase } = await requireUser();
  const input = OppdaterInput.safeParse({
    id: formData.get("id"),
    saved_amount: formData.get("saved_amount"),
  });
  if (!input.success) return { feil: "Ugyldig beløp." };

  const { data: mål } = await supabase
    .from("savings_goals")
    .select("target_amount")
    .eq("id", input.data.id)
    .eq("user_id", user.id)
    .single();
  if (!mål) return { feil: "Fant ikke målet." };

  const fullført = input.data.saved_amount >= mål.target_amount;
  const { error } = await supabase
    .from("savings_goals")
    .update({
      saved_amount: input.data.saved_amount,
      completed_at: fullført ? new Date().toISOString() : null,
    })
    .eq("id", input.data.id)
    .eq("user_id", user.id);
  if (error) return { feil: "Kunne ikke oppdatere." };
  revalidatePath("/app/sparemaal");
  revalidatePath("/app");
  return {};
}

export async function slettMaal(id: string) {
  const { user, supabase } = await requireUser();
  await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/sparemaal");
  revalidatePath("/app");
}
