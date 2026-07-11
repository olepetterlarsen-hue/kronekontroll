"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Knapp } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export function LoggUtKnapp() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-xl px-3 py-2 text-sm font-medium text-demp transition-colors hover:bg-flate-demp"
    >
      Logg ut
    </button>
  );
}

export function StartBetalingKnapp({ variant = "knapp" }: { variant?: "knapp" | "lenke" }) {
  const [laster, setLaster] = useState(false);

  async function start() {
    setLaster(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLaster(false);
    } catch {
      setLaster(false);
    }
  }

  if (variant === "lenke") {
    return (
      <button onClick={start} disabled={laster} className="font-semibold underline hover:no-underline">
        {laster ? "Åpner…" : "Aktiver abonnement nå"}
      </button>
    );
  }
  return (
    <Knapp onClick={start} disabled={laster}>
      {laster ? "Åpner betaling…" : "Fortsett for 49 kr/mnd"}
    </Knapp>
  );
}

export function AapnePortalKnapp() {
  const [laster, setLaster] = useState(false);
  return (
    <Knapp
      variant="sekundar"
      disabled={laster}
      onClick={async () => {
        setLaster(true);
        try {
          const res = await fetch("/api/stripe/portal", { method: "POST" });
          const data = await res.json();
          if (data.url) window.location.href = data.url;
          else setLaster(false);
        } catch {
          setLaster(false);
        }
      }}
    >
      {laster ? "Åpner…" : "Administrer abonnement"}
    </Knapp>
  );
}
