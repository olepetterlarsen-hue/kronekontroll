import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opprett konto",
  description: "Prøv Kronekontroll gratis i 14 dager. Se hvor pengene går, stopp gjeld i tide og nå sparemålene dine.",
  alternates: { canonical: "/registrer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
