import { NextRequest } from "next/server";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { genererUtkast } from "@/lib/ai";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { GenererUtkastInput } from "@/lib/schemas";

export const maxDuration = 120;

/** Genererer et e-postutkast i verkstedet. Brukeren redigerer og sender selv. */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireUser();

    const rl = rateLimit(`utkast:${user.id}`, { limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const input = GenererUtkastInput.safeParse(await request.json());
    if (!input.success) {
      return Response.json({ error: "Fyll ut mottaker og detaljer" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const utkast = await genererUtkast({
      ...input.data,
      avsenderNavn: profile?.full_name ?? undefined,
    });

    const { data: lagret, error } = await supabase
      .from("email_drafts")
      .insert({
        user_id: user.id,
        template_type: input.data.malType,
        subject: utkast.emne,
        body: utkast.broedtekst,
      })
      .select("id")
      .single();
    if (error) return Response.json({ error: "Kunne ikke lagre utkastet" }, { status: 500 });

    return Response.json({ id: lagret.id, emne: utkast.emne, broedtekst: utkast.broedtekst });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Kunne ikke generere utkast. Prøv igjen." }, { status: 500 });
  }
}
