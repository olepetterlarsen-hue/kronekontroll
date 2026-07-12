import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logg inn",
  description: "Logg inn på Kronekontroll og få oversikt over forbruk, gjeld og sparemål.",
  alternates: { canonical: "/logg-inn" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
