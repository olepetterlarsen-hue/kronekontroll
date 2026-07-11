/**
 * Adapter-lag for publisering til sosiale medier fra Innholdsstudio.
 * Alle plattformer er stubs til API-nøkler settes i miljøvariabler -
 * arkitekturen er klar, selve publiseringen er en liten jobb per plattform senere.
 */

export type Plattform = "instagram" | "tiktok" | "youtube" | "linkedin" | "x";

export interface PubliseringsResultat {
  ok: boolean;
  melding: string;
  eksternId?: string;
}

export interface SocialPublisher {
  readonly plattform: Plattform;
  erKonfigurert(): boolean;
  /** Publiserer et godkjent innlegg. body er innholdspakken fra Innholdsstudio. */
  publiser(post: { title: string; body: Record<string, unknown> }): Promise<PubliseringsResultat>;
}

function stub(plattform: Plattform, envKeys: string[]): SocialPublisher {
  return {
    plattform,
    erKonfigurert: () => envKeys.every((k) => Boolean(process.env[k])),
    async publiser() {
      if (!envKeys.every((k) => Boolean(process.env[k]))) {
        return {
          ok: false,
          melding: `${plattform} er ikke konfigurert. Sett ${envKeys.join(", ")} i miljøvariablene og implementer publiseringskallet i src/lib/social/publishers.ts.`,
        };
      }
      // Her kommer selve API-kallet når plattformen aktiveres:
      //  - instagram: Meta Graph API (container -> publish) med IG Business-konto
      //  - tiktok: TikTok Content Posting API
      //  - youtube: YouTube Data API (Shorts = vanlig video < 60 s)
      //  - linkedin: LinkedIn Marketing API (ugcPosts)
      //  - x: X API v2 (POST /2/tweets)
      return { ok: false, melding: `Publisering til ${plattform} er ikke implementert ennå.` };
    },
  };
}

export const publishers: Record<Plattform, SocialPublisher> = {
  instagram: stub("instagram", ["META_IG_USER_ID", "META_ACCESS_TOKEN"]),
  tiktok: stub("tiktok", ["TIKTOK_CLIENT_KEY", "TIKTOK_ACCESS_TOKEN"]),
  youtube: stub("youtube", ["YOUTUBE_CLIENT_ID", "YOUTUBE_REFRESH_TOKEN"]),
  linkedin: stub("linkedin", ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_ORG_ID"]),
  x: stub("x", ["X_API_KEY", "X_ACCESS_TOKEN"]),
};
