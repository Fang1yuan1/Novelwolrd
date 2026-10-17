import type { MetadataRoute } from "next";
import { getNovels } from "@/lib/novels";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// خريطة الموقع: الرئيسية + الأقسام + كل رواية (وفهرسها). الفصول يجدها جوجل عبر روابط الفهرس.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const novels = await getNovels();
  const fixed = ["", "/categories", "/completed", "/free", "/most-read", "/new-today", "/rankings"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.6,
  }));
  const items = novels.flatMap((n) => [
    {
      url: `${SITE_URL}/novel/${n.id}`,
      lastModified: n.created_at ? new Date(n.created_at) : undefined,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    { url: `${SITE_URL}/novel/${n.id}/toc`, changeFrequency: "daily" as const, priority: 0.5 },
  ]);
  return [...fixed, ...items];
}
