import type { NextConfig } from "next";

/**
 * Sikkerhetsheadere settes globalt her.
 * CSP er bevisst streng: ingen tredjeparts scripts. Vercel Analytics (om aktivert)
 * lastes fra egen origin via @vercel/analytics og trenger ingen ekstra kilder.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js trenger inline styles (styled-jsx/tailwind) og inline scripts for hydrering.
      // 'unsafe-eval' er KUN for dev-modus (React devtools) - aldri i produksjon.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // Supabase (auth + storage + database) er eneste eksterne tilkobling fra nettleseren
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} https://*.supabase.co`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Flere lockfiler finnes oppover i mappetreet; pin roten eksplisitt
  turbopack: { root: __dirname },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
