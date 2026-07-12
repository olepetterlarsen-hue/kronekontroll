"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Etikett, Felt, Knapp, Kort, inputKlasse } from "@/components/ui";
import { datoKort } from "@/lib/format";
import { godkjennPost, slettPost } from "./actions";

interface KøPost {
  id: string;
  platform: string;
  format: string;
  title: string;
  body: unknown;
  status: string;
  created_at: string;
}

const PLATTFORMER = [
  { id: "instagram", navn: "Instagram" },
  { id: "tiktok", navn: "TikTok" },
  { id: "youtube", navn: "YouTube Shorts" },
  { id: "linkedin", navn: "LinkedIn" },
  { id: "x", navn: "X" },
] as const;

export function Innholdsstudio({ kø }: { kø: KøPost[] }) {
  const router = useRouter();
  const [tema, setTema] = useState("");
  const [valgte, setValgte] = useState<string[]>(["instagram", "tiktok"]);
  const [laster, setLaster] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function generer() {
    setLaster(true);
    setMelding(null);
    try {
      const res = await fetch("/api/admin/innhold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, plattformer: valgte }),
      });
      const data = await res.json();
      setMelding(res.ok ? `Lagt ${data.antall} utkast i køen.` : data.error);
      if (res.ok) {
        setTema("");
        router.refresh();
      }
    } catch {
      setMelding("Mistet forbindelsen.");
    }
    setLaster(false);
  }

  async function publiser(postId: string) {
    setMelding(null);
    const res = await fetch("/api/admin/innhold", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    setMelding(data.melding ?? data.error ?? null);
    router.refresh();
  }

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-semibold">Innholdsstudio</h2>

      <Kort>
        <div className="space-y-4">
          <Felt
            label="Tema"
            id="tema"
            hjelpetekst="F.eks. «3 abonnementer nesten alle betaler for uten å bruke» eller en av guidene."
          >
            <input id="tema" className={inputKlasse} value={tema} onChange={(e) => setTema(e.target.value)} />
          </Felt>
          <fieldset>
            <legend className="text-sm font-semibold">Plattformer</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PLATTFORMER.map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primar ${
                    valgte.includes(p.id)
                      ? "border-primar bg-primar-lys text-primar-mork"
                      : "border-linje text-demp"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={valgte.includes(p.id)}
                    onChange={(e) =>
                      setValgte((prev) =>
                        e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id),
                      )
                    }
                  />
                  {p.navn}
                </label>
              ))}
            </div>
          </fieldset>
          <Knapp onClick={generer} disabled={laster || tema.trim().length < 3 || valgte.length === 0}>
            {laster ? "Genererer…" : "Generer innholdspakke"}
          </Knapp>
          {melding ? <p className="text-sm text-demp">{melding}</p> : null}
        </div>
      </Kort>

      {/* Publiseringskø */}
      <div className="space-y-3">
        {kø.length === 0 ? (
          <p className="text-sm text-demp">Køen er tom. Generer en innholdspakke over.</p>
        ) : (
          kø.map((post) => (
            <Kort key={post.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Etikett tone="primar">{post.platform}</Etikett>
                  <Etikett>{post.format}</Etikett>
                  <Etikett
                    tone={post.status === "publisert" ? "positiv" : post.status === "godkjent" ? "varsel" : "noytral"}
                  >
                    {post.status}
                  </Etikett>
                  <span className="text-xs text-demp">{datoKort(post.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  {post.status === "utkast" ? (
                    <Knapp
                      variant="sekundar"
                      disabled={pending}
                      onClick={() => startTransition(() => godkjennPost(post.id))}
                    >
                      Godkjenn
                    </Knapp>
                  ) : null}
                  {post.status === "godkjent" ? (
                    <Knapp onClick={() => publiser(post.id)}>Publiser</Knapp>
                  ) : null}
                  {post.status !== "publisert" ? (
                    <Knapp
                      variant="fare"
                      disabled={pending}
                      onClick={() => startTransition(() => slettPost(post.id))}
                    >
                      Slett
                    </Knapp>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium">{post.title}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-semibold text-primar">
                  Vis innhold
                </summary>
                <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-flate-demp/60 p-3 text-xs leading-relaxed">
                  {JSON.stringify(post.body, null, 2)}
                </pre>
              </details>
            </Kort>
          ))
        )}
      </div>
    </section>
  );
}
