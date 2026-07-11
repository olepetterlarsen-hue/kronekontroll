import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Supabase-klient for Server Components og Route Handlers.
 * Bruker anon-nøkkel + brukerens sesjonscookie, slik at Row Level Security
 * i databasen håndhever at brukeren kun ser sine egne rader.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Kalles fra en Server Component uten mulighet til å sette cookies.
          // Trygt å ignorere når middleware håndterer sesjonsfornyelse.
        }
      },
    },
  });
}
