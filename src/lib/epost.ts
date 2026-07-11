import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { site } from "@/lib/site";

/**
 * Utgående e-post via Resend. All e-post er på norsk.
 * PERSONVERN: logg aldri innholdet i e-poster, kun type og bruker-id (gjøres i notifications_log).
 */

function resend() {
  return new Resend(env.resendApiKey());
}

function ramme(innhold: string, avmeldingsUrl?: string): string {
  return `<!doctype html>
<html lang="nb"><body style="margin:0;padding:0;background:#faf9f5;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1c2b28;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-size:18px;font-weight:700;color:#0e5f58;margin:0 0 24px;">Kronekontroll</p>
    <div style="background:#ffffff;border:1px solid #e6e3da;border-radius:16px;padding:28px;">
      ${innhold}
    </div>
    <p style="font-size:12px;color:#5b6a66;margin:20px 4px 0;line-height:1.6;">
      Du får denne e-posten fordi du har en konto hos ${site.name}.
      ${avmeldingsUrl ? `<a href="${avmeldingsUrl}" style="color:#5b6a66;">Endre varslingsinnstillinger</a>.` : ""}
      <br/>${site.name} · ${site.supportEmail}
    </p>
  </div>
</body></html>`;
}

export async function sendVarsel(opts: {
  til: string;
  emne: string;
  htmlInnhold: string;
  kanAvmeldes?: boolean;
}): Promise<void> {
  await resend().emails.send({
    from: `${site.name} <${site.senderEmail}>`,
    to: opts.til,
    subject: opts.emne,
    html: ramme(
      opts.htmlInnhold,
      opts.kanAvmeldes ? `${site.url}/app/innstillinger` : undefined,
    ),
  });
}

export function fristVarselHtml(oppgave: { title: string; due_date: string }, dager: number): string {
  const naar = dager <= 1 ? "i morgen" : `om ${dager} dager`;
  return `
    <h1 style="font-size:20px;margin:0 0 12px;">Frist ${naar}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Oppgaven <strong>${escapeHtml(oppgave.title)}</strong> har frist
      ${new Date(oppgave.due_date).toLocaleDateString("nb-NO", { day: "numeric", month: "long" })}.
    </p>
    <a href="${site.url}/app/gjeld" style="display:inline-block;background:#0e5f58;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;">
      Åpne oppgaven
    </a>`;
}

export function sparemaalHtml(navn: string, prosentNaadd: number): string {
  return `
    <h1 style="font-size:20px;margin:0 0 12px;">${prosentNaadd >= 100 ? "Sparemål nådd!" : `${prosentNaadd} % av veien`}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      ${prosentNaadd >= 100
        ? `Gratulerer! Du har nådd sparemålet <strong>${escapeHtml(navn)}</strong>. Det står det respekt av.`
        : `Du har passert ${prosentNaadd} % av sparemålet <strong>${escapeHtml(navn)}</strong>. Fortsett sånn!`}
    </p>
    <a href="${site.url}/app/sparemaal" style="display:inline-block;background:#0e5f58;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;">
      Se sparemålene dine
    </a>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
