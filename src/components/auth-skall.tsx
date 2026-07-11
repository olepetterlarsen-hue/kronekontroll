import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/marketing";

export function AuthSkall({ tittel, under, children }: { tittel: string; under?: ReactNode; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-sm rounded-kort border border-linje bg-flate p-8 shadow-kort">
        <h1 className="text-2xl font-bold">{tittel}</h1>
        {under ? <p className="mt-1.5 text-sm text-demp">{under}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-xs text-demp">
        <Link href="/" className="hover:text-primar">
          ← Tilbake til forsiden
        </Link>
      </p>
    </main>
  );
}
