import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Fanger opp bekreftelses- og tilbakestillingslenker fra e-post. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const neste = searchParams.get("neste");
  const mål = neste && neste.startsWith("/") ? neste : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${mål}`);
    }
  }

  return NextResponse.redirect(`${origin}/logg-inn?feil=lenke`);
}
