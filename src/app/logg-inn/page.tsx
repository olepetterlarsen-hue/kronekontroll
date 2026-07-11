"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthSkall } from "@/components/auth-skall";
import { Felt, Knapp, inputKlasse } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function LoggInnForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    setLaster(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: epost, password: passord });
    setLaster(false);
    if (error) {
      setFeil("Feil e-post eller passord.");
      return;
    }
    const neste = searchParams.get("neste");
    router.push(neste && neste.startsWith("/") ? neste : "/app");
    router.refresh();
  }

  return (
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
      <Felt label="Passord" id="passord">
        <input
          id="passord"
          type="password"
          className={inputKlasse}
          value={passord}
          onChange={(e) => setPassord(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Felt>
      {feil ? <p role="alert" className="text-sm text-negativ">{feil}</p> : null}
      <Knapp type="submit" className="w-full" disabled={laster}>
        {laster ? "Logger inn…" : "Logg inn"}
      </Knapp>
      <p className="text-center text-xs text-demp">
        <Link href="/glemt-passord" className="hover:text-primar">Glemt passordet?</Link>
      </p>
    </form>
  );
}

export default function LoggInn() {
  return (
    <AuthSkall
      tittel="Logg inn"
      under={
        <>
          Ny her?{" "}
          <Link href="/registrer" className="font-semibold text-primar hover:underline">
            Prøv gratis i 14 dager
          </Link>
        </>
      }
    >
      <Suspense>
        <LoggInnForm />
      </Suspense>
    </AuthSkall>
  );
}
