import {
  getChapterPreview,
  getNovelById,
  getRelatedNovels,
} from "@/lib/novels";
import { notFound } from "next/navigation";
import MobileNovelDetail from "@/components/mobile/MobileNovelDetail";
import PhoneFrame from "@/components/PhoneFrame";

export const revalidate = 600; // مخزّنة ISR: تُبنى مرة وتُخدم بدون CPU، وتتجدد بالخلفية بعد هذه المدة (ثواني)

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
  return (
    <PhoneFrame>
      <MobileNovelDetail
        novel={novel}
        chapters={chapters}
        chapterTotal={chapterTotal}
        related={related}
      />
    </PhoneFrame>
  );
}
