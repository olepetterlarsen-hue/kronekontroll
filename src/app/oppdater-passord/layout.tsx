import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sett nytt passord",
  description: "Sett nytt passord på Kronekontroll-kontoen din.",
  alternates: { canonical: "/oppdater-passord" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
