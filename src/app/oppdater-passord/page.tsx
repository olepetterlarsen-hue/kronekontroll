"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthSkall } from "@/components/auth-skall";
import { Felt, Knapp, inputKlasse } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function OppdaterPassord() {
  const router = useRouter();
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passord });
    if (error) {
      setFeil("Kunne ikke oppdatere passordet. Lenken kan være utløpt - be om en ny.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <AuthSkall tittel="Sett nytt passord">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Felt label="Nytt passord" id="passord" hjelpetekst="Minst 8 tegn.">
          <input
            id="passord"
            type="password"
            className={inputKlasse}
            value={passord}
            onChange={(e) => setPassord(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Felt>
        {feil ? <p role="alert" className="text-sm text-negativ">{feil}</p> : null}
        <Knapp type="submit" className="w-full">Lagre passord</Knapp>
      </form>
    </AuthSkall>
  );
}
