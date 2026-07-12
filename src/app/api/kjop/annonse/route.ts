import { NextRequest } from "next/server";
import { z } from "zod";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";

export const maxDuration = 30;

/**
 * Henter nøkkelfakta fra en Finn-annonse (tittel, pris, bil-info).
 * SIKKERHET (SSRF): kun URL-er på finn.no hentes - alt annet avvises før fetch.
 * Tolkningen er beste-evne fra sidens metadata; brukeren kan alltid justere
 * tallene manuelt i skjemaet etterpå.
 */

const Input = z.object({ url: z.string().url().max(500) });

const TILLATTE_VERTER = new Set(["www.finn.no", "finn.no", "m.finn.no"]);

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser();
    const rl = rateLimit(`finn:${user.id}`, { limit: 30, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const body = Input.safeParse(await request.json());
    if (!body.success) return Response.json({ error: "Ugyldig lenke" }, { status: 400 });

    const url = new URL(body.data.url);
    if (url.protocol !== "https:" || !TILLATTE_VERTER.has(url.hostname)) {
      return Response.json({ error: "Lim inn en lenke fra finn.no" }, { status: 400 });
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (kompatibel; Kronekontroll/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return Response.json(
        { error: "Fikk ikke hentet annonsen. Fyll inn tittel og pris manuelt." },
        { status: 422 },
      );
    }
    const html = (await res.text()).slice(0, 800_000);

    // Tittel fra og:title
    const tittel =
      html.match(/property="og:title"\s+content="([^"]+)"/)?.[1] ??
      html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/\s*\|\s*FINN.*$/i, "") ??
      null;

    // Pris: prøv strukturerte felt først, deretter "kr"-mønstre i innholdet
    const pris =
      tallFra(html.match(/"price"\s*:\s*"?(\d[\d\s]*)/)?.[1]) ??
      tallFra(html.match(/"amount"\s*:\s*"?(\d[\d\s]*)/)?.[1]) ??
      tallFra(html.match(/(\d{1,3}(?:[\s ]\d{3})+)\s*kr/)?.[1]) ??
      null;

    // Bil? Finn-mobilitetsannonser ligger under /car/ eller /mobility/
    const erBil = /\/(car|mobility)\//.test(url.pathname);

    let bilinfo: { aarsmodell: number | null; km: number | null } | null = null;
    if (erBil) {
      const aarsmodell = tallFra(
        (tittel ?? "").match(/\b(19[89]\d|20[0-2]\d)\b/)?.[1] ??
          html.match(/"(?:year|modelYear)"\s*:\s*"?(\d{4})/)?.[1],
      );
      const km = tallFra(html.match(/"(?:mileage|kilometer)"\s*:\s*"?(\d[\d\s]*)/)?.[1]);
      bilinfo = { aarsmodell, km };
    }

    if (!tittel && !pris) {
      return Response.json(
        { error: "Klarte ikke å lese annonsen. Fyll inn tittel og pris manuelt." },
        { status: 422 },
      );
    }

    return Response.json({ tittel, pris, erBil, bilinfo, url: url.toString() });
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json(
      { error: "Fikk ikke hentet annonsen. Fyll inn tittel og pris manuelt." },
      { status: 422 },
    );
  }
}

function tallFra(s: string | undefined | null): number | null {
  if (!s) return null;
  const n = Number(String(s).replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
