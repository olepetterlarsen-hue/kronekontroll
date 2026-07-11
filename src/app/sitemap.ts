import type { MetadataRoute } from "next";
import { guides } from "@/content/guider";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const statiske = ["", "/guider", "/personvern", "/vilkar", "/angrerett", "/registrer", "/logg-inn"].map(
    (path) => ({
      url: `${site.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.6,
    }),
  );

  const guideSider = guides.map((g) => ({
    url: `${site.url}/guider/${g.slug}`,
    lastModified: g.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...statiske, ...guideSider];
}
