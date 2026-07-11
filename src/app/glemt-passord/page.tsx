"use client";

import { useState } from "react";
import { AuthSkall } from "@/components/auth-skall";
import { Felt, Knapp, inputKlasse } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function GlemtPassord() {
  const [epost, setEpost] = useState("");
  const [sendt, setSendt] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(epost, {
      redirectTo: `${window.location.origin}/auth/callback?neste=/oppdater-passord`,
    });
    // Samme svar uansett om adressen finnes - røper ikke hvem som er kunde
    setSendt(true);
  }

  return (
    <AuthSkall tittel="Glemt passord" under="Vi sender deg en lenke for å sette nytt passord.">
      {sendt ? (
        <p className="text-sm leading-relaxed text-demp">
          Hvis <strong className="text-blekk">{epost}</strong> har en konto hos oss, kommer det en
          e-post med lenke i løpet av et minutt.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Felt label="E-post" id="epost">
            <input
              id="epost"
              type="email"
              className={inputKlasse}
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              autoComplete="email"
              required
            />
          </Felt>
          <Knapp type="submit" className="w-full">Send lenke</Knapp>
        </form>
      )}
    </AuthSkall>
  );
}
