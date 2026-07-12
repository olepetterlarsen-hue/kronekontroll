"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Appmeny med aktiv-tilstand og aria-current, horisontalt scrollbar på mobil. */
export function AppNav({
  lenker,
  visAdmin,
}: {
  lenker: readonly { href: string; label: string }[];
  visAdmin: boolean;
}) {
  const pathname = usePathname();

  const erAktiv = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <nav aria-label="Appmeny" className="flex min-w-0 gap-1 overflow-x-auto pb-1 lg:flex-col lg:pb-0">
      {lenker.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={erAktiv(item.href) ? "page" : undefined}
          className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            erAktiv(item.href)
              ? "bg-primar-lys font-semibold text-primar-mork"
              : "text-demp hover:bg-primar-lys hover:text-primar-mork"
          }`}
        >
          {item.label}
        </Link>
      ))}
      {visAdmin ? (
        <Link
          href="/admin"
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
          className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/admin")
              ? "bg-aksent-lys font-semibold text-aksent-mork"
              : "text-aksent-mork hover:bg-aksent-lys"
          }`}
        >
          Admin
        </Link>
      ) : null}
    </nav>
  );
}
