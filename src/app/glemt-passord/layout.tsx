import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glemt passord",
  description: "Få tilsendt lenke for å sette nytt passord på Kronekontroll-kontoen din.",
  alternates: { canonical: "/glemt-passord" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
