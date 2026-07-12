import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * OG-bilde generert i kode (designet i Figma: Kronekontroll - brand assets).
 * Riktig 1200x630, samme palett som resten av merkevaren. Figtree-fontene
 * ligger lokalt i og-fonts/ så bold-vektene rendres riktig.
 */
export const alt = "Kronekontroll - ro i magen, kontroll på krona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgBilde() {
  const [bold, medium] = await Promise.all([
    readFile(join(process.cwd(), "src/app/og-fonts/Figtree-Bold.ttf")),
    readFile(join(process.cwd(), "src/app/og-fonts/Figtree-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf9f5",
          padding: "72px 96px",
          position: "relative",
          fontFamily: "Figtree",
        }}
      >
        {/* Myke bakgrunnsblobber */}
        <div style={{ position: "absolute", left: 760, top: -160, width: 640, height: 640, borderRadius: 9999, backgroundColor: "#e2efec" }} />
        <div style={{ position: "absolute", left: 1010, top: 380, width: 340, height: 340, borderRadius: 9999, backgroundColor: "#fbe9e1" }} />
        <div style={{ position: "absolute", left: -120, top: 420, width: 360, height: 360, borderRadius: 9999, backgroundColor: "#e2efec" }} />

        {/* Kronemynt */}
        <div
          style={{
            position: "absolute",
            left: 980,
            top: 80,
            width: 120,
            height: 120,
            borderRadius: 9999,
            backgroundColor: "#d96e48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 9999,
              backgroundColor: "#e6825c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            kr
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 42, fontWeight: 700, color: "#0a453f" }}>
          Kronekontroll
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
          <div style={{ fontSize: 88, fontWeight: 700, color: "#1c2b28", lineHeight: 1.08 }}>
            Ro i magen.
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, color: "#0e5f58", lineHeight: 1.08 }}>
            Kontroll på krona.
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 27, color: "#4a5c58" }}>
          Se hvor pengene lekker · stopp gjeld i tide · nå sparemålene
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            backgroundColor: "#0e5f58",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 700,
            padding: "14px 32px",
            borderRadius: 9999,
            alignSelf: "flex-start",
          }}
        >
          49 kr/mnd · 14 dager gratis
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Figtree", data: medium, weight: 500, style: "normal" },
        { name: "Figtree", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
