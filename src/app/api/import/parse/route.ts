import { NextRequest } from "next/server";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { parseDokument } from "@/lib/ai";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { DokumentTypeSchema } from "@/lib/schemas";

export const maxDuration = 300; // AI-tolkning av lange kontoutskrifter kan ta tid

const MAKS_FILSTORRELSE = 15 * 1024 * 1024; // 15 MB
const TILLATTE_TYPER = new Set(["application/pdf", "text/csv", "text/plain", "message/rfc822"]);

/**
 * Tar imot ett dokument, lagrer det i brukerens private mappe i Storage,
 * tolker det med Claude og returnerer strukturert data til bekreftelsesvisning.
 * Ingenting lagres i databasen før brukeren bekrefter (/api/import/confirm).
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireUser();

    const rl = rateLimit(`parse:${user.id}`, { limit: 20, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds);

    const form = await request.formData();
    const docTypeRaw = form.get("docType");
    const fil = form.get("fil");
    const limtTekst = form.get("tekst");

    const docTypeParsed = DokumentTypeSchema.safeParse(docTypeRaw);
    if (!docTypeParsed.success) {
      return Response.json({ error: "Ugyldig dokumenttype" }, { status: 400 });
    }
    const docType = docTypeParsed.data;

    let pdfBase64: string | undefined;
    let tekst: string | undefined;
    let originalName = "innlimt-tekst.txt";
    let storagePath: string | null = null;

    if (fil instanceof File) {
      if (fil.size === 0 || fil.size > MAKS_FILSTORRELSE) {
        return Response.json({ error: "Filen må være mellom 1 byte og 15 MB" }, { status: 400 });
      }
      if (fil.type && !TILLATTE_TYPER.has(fil.type) && !fil.name.endsWith(".eml")) {
        return Response.json(
          { error: "Støttede formater: PDF, CSV, tekst og .eml" },
          { status: 400 },
        );
      }
      originalName = fil.name;
      const bytes = Buffer.from(await fil.arrayBuffer());

      // Lagre originalen i brukerens egen mappe (RLS-policy på storage håndhever eierskap)
      storagePath = `${user.id}/${Date.now()}-${sanitizeFilename(fil.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("dokumenter")
        .upload(storagePath, bytes, { contentType: fil.type || "application/octet-stream" });
      if (uploadError) {
        return Response.json({ error: "Kunne ikke lagre filen" }, { status: 500 });
      }

      if (fil.type === "application/pdf") {
        pdfBase64 = bytes.toString("base64");
      } else {
        tekst = bytes.toString("utf-8");
      }
    } else if (typeof limtTekst === "string" && limtTekst.trim().length > 0) {
      tekst = limtTekst.slice(0, 100_000);
    } else {
      return Response.json({ error: "Last opp en fil eller lim inn tekst" }, { status: 400 });
    }

    // Registrer dokumentet (via brukerens egen klient, RLS setter eierskapet)
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        doc_type: docType,
        original_name: originalName,
        storage_path: storagePath ?? "",
        status: "mottatt",
      })
      .select("id")
      .single();
    if (docError || !doc) {
      return Response.json({ error: "Kunne ikke registrere dokumentet" }, { status: 500 });
    }

    try {
      const parsed = await parseDokument(docType, { pdfBase64, tekst });
      await supabase
        .from("documents")
        .update({ status: "tolket", parsed: parsed.data })
        .eq("id", doc.id);
      return Response.json({ documentId: doc.id, docType, parsed: parsed.data });
    } catch {
      // Ikke logg dokumentinnhold - kun at tolkningen feilet
      await supabase.from("documents").update({ status: "feilet" }).eq("id", doc.id);
      return Response.json(
        { error: "Klarte ikke å tolke dokumentet. Sjekk at filen er lesbar og prøv igjen." },
        { status: 422 },
      );
    }
  } catch (e) {
    const authResp = authErrorResponse(e);
    if (authResp) return authResp;
    return Response.json({ error: "Noe gikk galt" }, { status: 500 });
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._æøåÆØÅ-]/g, "_").slice(0, 120);
}
