import type { MetadataRoute } from "next";
import { db } from "@/lib/data";
import { SITE } from "@/content/site";

const STATIC_ROUTES = [
  "",
  "/academy",
  "/programmes",
  "/training",
  "/achievements",
  "/success-stories",
  "/store",
  "/enrol",
  "/pay",
  "/privacy",
  "/terms",
  "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const [productSlugs, storySlugs] = await Promise.all([db.getPublishedProductSlugs(), db.getPublishedStorySlugs()]);

  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${SITE.url}/store/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const storyEntries: MetadataRoute.Sitemap = storySlugs.map((slug) => ({
    url: `${SITE.url}/success-stories/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticEntries, ...productEntries, ...storyEntries];
}
