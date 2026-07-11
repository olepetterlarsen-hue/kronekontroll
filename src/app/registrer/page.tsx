"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthSkall } from "@/components/auth-skall";
import { Felt, Knapp, inputKlasse } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function Registrer() {
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [laster, setLaster] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    setLaster(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: epost,
      password: passord,
      options: {
        data: { full_name: navn },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLaster(false);
    if (error) {
      setFeil(
        error.message.includes("already registered")
          ? "Denne e-postadressen er allerede registrert. Prøv å logge inn."
          : "Kunne ikke opprette konto. Sjekk at passordet er minst 8 tegn.",
      );
      return;
    }
    setSendt(true);
  }

  if (sendt) {
    return (
      <AuthSkall tittel="Sjekk innboksen din">
        <p className="text-sm leading-relaxed text-demp">
          Vi har sendt en bekreftelseslenke til <strong className="text-blekk">{epost}</strong>.
          Klikk på den for å aktivere kontoen, så er du i gang med 14 dager gratis.
        </p>
      </AuthSkall>
    );
  }

  return (
    <AuthSkall
      tittel="Opprett konto"
      under={
        <>
          14 dager gratis, uten kort. Har du konto?{" "}
          <Link href="/logg-inn" className="font-semibold text-primar hover:underline">
            Logg inn
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Felt label="Navn" id="navn">
          <input
            id="navn"
            className={inputKlasse}
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            autoComplete="name"
            required
          />
        </Felt>
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
        <Felt label="Passord" id="passord" hjelpetekst="Minst 8 tegn.">
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
        <Knapp type="submit" className="w-full" disabled={laster}>
          {laster ? "Oppretter…" : "Opprett konto"}
        </Knapp>
        <p className="text-xs leading-relaxed text-demp">
          Ved å opprette konto godtar du{" "}
          <Link href="/vilkar" className="underline hover:text-primar">vilkårene</Link> og{" "}
          <Link href="/personvern" className="underline hover:text-primar">personvernerklæringen</Link>.
        </p>
      </form>
    </AuthSkall>
  );
}
