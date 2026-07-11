import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { publishers, type Plattform } from "@/lib/social/publishers";

export const maxDuration = 300;

/**
 * Innholdsstudio (kun admin): genererer komplette innholdspakker for sosiale
 * medier fra et tema, og legger dem i publiserings-køen som utkast.
 */

const InnholdspakkeSchema = z.object({
  reelsManus: z.object({
    hook: z.string().describe("Første 2 sekunder, det som stopper scrollingen"),
    replikker: z.array(z.string()).describe("Replikk for replikk, talespråk"),
    klippInstruksjoner: z.array(z.string()).describe("Hva som vises i hvert klipp"),
    caption: z.string(),
    hashtags: z.array(z.string()),
  }),
  karusell: z.object({
    slides: z.array(z.object({ tittel: z.string(), tekst: z.string() })).describe("5-8 slides"),
    caption: z.string(),
  }),
  tiktokManus: z.object({
    hook: z.string(),
    replikker: z.array(z.string()),
    caption: z.string(),
  }),
  linkedinPost: z.string(),
  xPost: z.string().describe("Maks 280 tegn"),
});

const GenererInput = z.object({
  tema: z.string().min(3).max(300),
  plattformer: z.array(z.enum(["instagram", "tiktok", "youtube", "linkedin", "x"])).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();

    const input = GenererInput.safeParse(await request.json());
    if (!input.success) return Response.json({ error: "Ugyldig input" }, { status: 400 });

    const client = new Anthropic({ apiKey: env.anthropicApiKey() });
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: `Du lager innhold for sosiale medier for Kronekontroll (kronekontroll.no),
en norsk tjeneste til 49 kr/mnd som hjelper privatpersoner å unngå å betale for mye,
stoppe gjeld i tide og nå sparemål. Stemmen er trygg, folkelig, konkret norsk bokmål -
aldri skam, aldri hype, aldri tankestrek. Innholdet skal gi ekte verdi i seg selv
(konkrete grep folk kan gjøre i dag), med Kronekontroll som naturlig avslutning.
Aldri konkrete lovsatser eller kronebeløp som kan bli utdatert.`,
      messages: [{ role: "user", content: `Lag en komplett innholdspakke om temaet: ${input.data.tema}` }],
      output_config: { format: zodOutputFormat(InnholdspakkeSchema) },
    });

    const pakke = response.parsed_output;
    if (!pakke) return Response.json({ error: "Kunne ikke generere innhold" }, { status: 500 });

    const rader = input.data.plattformer.map((plattform) => {
      const innhold: Record<Plattform, { format: string; body: unknown }> = {
        instagram: { format: "reels_manus", body: { reels: pakke.reelsManus, karusell: pakke.karusell } },
        tiktok: { format: "video_manus", body: pakke.tiktokManus },
        youtube: { format: "shorts_manus", body: pakke.reelsManus },
        linkedin: { format: "post", body: { tekst: pakke.linkedinPost } },
        x: { format: "post", body: { tekst: pakke.xPost } },
      };
      return {
        platform: plattform,
        format: innhold[plattform].format,
        title: input.data.tema.slice(0, 200),
        body: innhold[plattform].body,
        status: "utkast" as const,
      };
    });

    const { error } = await supabase.from("social_posts").insert(rader);
    if (error) return Response.json({ error: "Kunne ikke lagre i køen" }, { status: 500 });

    return Response.json({ ok: true, antall: rader.length });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}

const PubliserInput = z.object({ postId: z.string().uuid() });

/** Forsøker å publisere et godkjent innlegg via plattform-adapteren (stub til nøkler settes). */
export async function PUT(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();

    const input = PubliserInput.safeParse(await request.json());
    if (!input.success) return Response.json({ error: "Ugyldig input" }, { status: 400 });

    const { data: post } = await supabase
      .from("social_posts")
      .select("id, platform, title, body, status")
      .eq("id", input.data.postId)
      .single();
    if (!post) return Response.json({ error: "Fant ikke innlegget" }, { status: 404 });
    if (post.status !== "godkjent") {
      return Response.json({ error: "Innlegget må godkjennes før publisering" }, { status: 400 });
    }

    const publisher = publishers[post.platform as Plattform];
    const resultat = await publisher.publiser({ title: post.title, body: post.body });

    if (resultat.ok) {
      await supabase
        .from("social_posts")
        .update({ status: "publisert", published_at: new Date().toISOString() })
        .eq("id", post.id);
    }

    return Response.json(resultat);
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}
