import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
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

  const [products, stories] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true } }).catch(() => []),
    prisma.successStory.findMany({ where: { published: true }, select: { slug: true } }).catch(() => []),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/store/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const storyEntries: MetadataRoute.Sitemap = stories.map((s) => ({
    url: `${SITE.url}/success-stories/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticEntries, ...productEntries, ...storyEntries];
}
