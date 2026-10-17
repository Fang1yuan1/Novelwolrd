import {
  getChapterPreview,
  getNovelById,
  getRelatedNovels,
} from "@/lib/novels";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import MobileNovelDetail from "@/components/mobile/MobileNovelDetail";
import PhoneFrame from "@/components/PhoneFrame";

export const revalidate = 600; // مخزّنة ISR: تُبنى مرة وتُخدم بدون CPU، وتتجدد بالخلفية بعد هذه المدة (ثواني)

// عنوان الصفحة لجوجل: الاسم العربي ثم الإنجليزي (الإنجليزي بالعنوان والبيانات المنظمة فقط، لا يظهر للقارئ بالصفحة)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const novel = await getNovelById(id);
  if (!novel) return {};
  const title = novel.title_en ? `${novel.title} | ${novel.title_en}` : novel.title;
  const desc =
    (novel.description || "").replace(/\s+/g, " ").trim().slice(0, 155) ||
    `اقرأ رواية ${novel.title} مترجمة إلى العربية على عالم الروايات.`;
  return {
    title: `رواية ${title}`,
    description: desc,
    alternates: { canonical: `/novel/${novel.id}` },
    openGraph: {
      type: "book",
      title: `رواية ${title}`,
      description: desc,
      url: `${SITE_URL}/novel/${novel.id}`,
      images: novel.cover_url ? [{ url: novel.cover_url }] : undefined,
    },
  };
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  // كل الطلبات مع بعض (مو ورا بعض) وكلها خفيفة: معاينة الفصول (أول فصل + آخر ٣٠ + العدد) بدل القائمة كاملة، وأعمال المؤلف والمشابهة بفلتر بقاعدة البيانات
  const [preview, related] = await Promise.all([
    getChapterPreview(id),
    getRelatedNovels(novel.category, novel.id, 6),
  ]);

  // معاينة الفصول: أول فصل (لزر «ابدأ القراءة») + آخر الفصول، بدون تكرار
  const chapters =
    preview.first && !preview.recent.some((c) => c.id === preview.first!.id)
      ? [preview.first, ...preview.recent]
      : preview.recent;
  const chapterTotal = preview.total;

  // صفحة الجوال لكل الأجهزة (آيباد/لابتوب أيضًا) — بدون تغيّر عند تصغير الشاشة
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    ...(novel.title_en ? { alternateName: novel.title_en } : {}),
    inLanguage: "ar",
    url: `${SITE_URL}/novel/${novel.id}`,
    ...(novel.author ? { author: { "@type": "Person", name: novel.author } } : {}),
    ...(novel.cover_url ? { image: novel.cover_url } : {}),
    ...(novel.description ? { description: novel.description.slice(0, 300) } : {}),
  };

  return (
    <PhoneFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MobileNovelDetail
        novel={novel}
        chapters={chapters}
        chapterTotal={chapterTotal}
        related={related}
      />
    </PhoneFrame>
  );
}
