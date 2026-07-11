import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Innloggede flater og API skal ikke indekseres
        disallow: ["/app", "/admin", "/api"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
