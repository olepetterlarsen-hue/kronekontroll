"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const PlanInput = z.object({
  title: z.string().min(1).max(200),
  price: z.coerce.number().positive().max(100_000_000),
  monthly_saving: z.coerce.number().min(0).max(10_000_000),
  already_saved: z.coerce.number().min(0).max(100_000_000).default(0),
  is_vehicle: z.boolean(),
  finn_url: z.string().url().max(500).nullable(),
  vehicle_info: z
    .object({ aarsmodell: z.number().nullable(), km: z.number().nullable(), drivstoff: z.string() })
    .nullable(),
});

export async function lagreKjopsplan(input: unknown): Promise<{ feil?: string; id?: string }> {
  const { user, supabase } = await requireUser();

  const parsed = PlanInput.safeParse(input);
  if (!parsed.success) return { feil: "Sjekk feltene - tittel, pris og sparebeløp må fylles ut." };

  const { data, error } = await supabase
    .from("purchase_plans")
    .insert({ user_id: user.id, ...parsed.data })
    .select("id")
    .single();
  if (error || !data) return { feil: "Kunne ikke lagre kjøpsplanen." };

  revalidatePath("/app/kjop");
  return { id: data.id };
}

export async function slettKjopsplan(id: string) {
  const { user, supabase } = await requireUser();
  await supabase.from("purchase_plans").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/kjop");
}
