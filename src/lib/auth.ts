import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Henter innlogget bruker eller kaster. Brukes øverst i alle beskyttede
 * route handlers slik at ingen kode kjører uten verifisert identitet.
 */
export async function requireUser(): Promise<{ user: User; supabase: SupabaseClient }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Ikke innlogget");
  return { user, supabase };
}

/** Som requireUser, men krever også admin-flagg i profilen. */
export async function requireAdmin() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new AuthError("Krever administrator", 403);
  return { user, supabase };
}

export function authErrorResponse(e: unknown): Response | null {
  if (e instanceof AuthError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  return null;
}
