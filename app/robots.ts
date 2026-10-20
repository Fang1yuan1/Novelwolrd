import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/search", "/api", "/community", "/novel/*/community"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
