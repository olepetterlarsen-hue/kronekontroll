"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

export async function oppdaterProfil(formData: FormData): Promise<{ feil?: string }> {
  const { user, supabase } = await requireUser();
  const navn = z.string().min(1).max(120).safeParse(formData.get("full_name"));
  if (!navn.success) return { feil: "Skriv inn navnet ditt." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: navn.data })
    .eq("id", user.id);
  if (error) return { feil: "Kunne ikke lagre." };
  revalidatePath("/app/innstillinger");
  return {};
}

const VarslerInput = z.object({
  task_reminders: z.boolean(),
  weekly_summary: z.boolean(),
  savings_milestones: z.boolean(),
});

export async function oppdaterVarsler(formData: FormData): Promise<{ feil?: string }> {
  const { user, supabase } = await requireUser();
  const input = VarslerInput.parse({
    task_reminders: formData.get("task_reminders") === "on",
    weekly_summary: formData.get("weekly_summary") === "on",
    savings_milestones: formData.get("savings_milestones") === "on",
  });

  const { error } = await supabase
    .from("notification_settings")
    .update(input)
    .eq("user_id", user.id);
  if (error) return { feil: "Kunne ikke lagre varslingsvalgene." };
  revalidatePath("/app/innstillinger");
  return {};
}
