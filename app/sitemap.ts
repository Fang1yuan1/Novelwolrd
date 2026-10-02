import type { MetadataRoute } from "next";
import { getNovels, parseCategories } from "@/lib/novels";

// غيّر الدومين هنا لو تغيّر مستقبلاً
const SITE_URL = "https://novelwolrd.com";

// sitemap.xml ديناميكي: كل رواية + الصفحات الثابتة المهمة + كل تصنيف موجود فعليًا.
// ما حطيناش كل فصل فصل (ممكن يوصل لعشرات الآلاف)؛ صفحة الرواية كافية لجوجل يكتشف
// فصولها عن طريق الروابط الداخلية. لو حبيت نضيف الفصول لاحقًا، نعمل sitemap منفصل لها.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const novels = await getNovels();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/rankings`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/most-read`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/completed`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/free`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/new-today`, changeFrequency: "daily", priority: 0.7 },
  ];

  const novelPages: MetadataRoute.Sitemap = novels.map((n) => ({
    url: `${SITE_URL}/novel/${n.id}`,
    lastModified: n.created_at ? new Date(n.created_at) : undefined,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const categorySet = new Set<string>();
  for (const n of novels) {
    for (const c of parseCategories(n.category)) categorySet.add(c);
  }
  const categoryPages: MetadataRoute.Sitemap = [...categorySet].map((c) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(c)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...novelPages, ...categoryPages];
}
