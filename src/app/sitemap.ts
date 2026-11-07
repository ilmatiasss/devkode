import type { MetadataRoute } from "next";
import { servicios } from "@/content/servicios";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/servicios`, changeFrequency: "monthly", priority: 0.9 },
    ...servicios.map((s) => ({ url: `${site.url}/servicios/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${site.url}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terminos`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
