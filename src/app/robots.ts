import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/api", "/checkout", "/pay/result", "/set-password"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
