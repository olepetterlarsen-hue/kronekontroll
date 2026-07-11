"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function godkjennPost(postId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("social_posts").update({ status: "godkjent" }).eq("id", postId);
  revalidatePath("/admin");
}

export async function slettPost(postId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("social_posts").delete().eq("id", postId);
  revalidatePath("/admin");
}
