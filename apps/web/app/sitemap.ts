import type { MetadataRoute } from "next";
import { CATEGORY_PAGES } from "@/lib/categories";

const SITE_URL = "https://ekorafon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_PAGES.map((c) => ({
    url: `${SITE_URL}/manufacturers/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/factories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...categoryPages,
    { url: `${SITE_URL}/rfq`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/trade`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/help`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
