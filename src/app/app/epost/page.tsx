import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EpostVerksted } from "./verksted";

export const metadata = { title: "E-postverksted" };

export default async function EpostSide() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logg-inn");

  const { data: utkast } = await supabase
    .from("email_drafts")
    .select("id, template_type, subject, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">E-postverksted</h1>
        <p className="mt-1 max-w-xl text-sm text-demp">
          Velg hva du trenger, beskriv saken kort, og få et ferdig utkast. Les alltid gjennom og
          juster før du sender - det er du som sender, fra din egen e-post.
        </p>
      </div>
      <EpostVerksted tidligere={utkast ?? []} />
    </div>
  );
}
