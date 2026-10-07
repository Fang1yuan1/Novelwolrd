import {
  getChapterPreview,
  getNovelById,
  getRelatedNovels,
} from "@/lib/novels";
import { notFound } from "next/navigation";
import MobileNovelDetail from "@/components/mobile/MobileNovelDetail";

export const dynamic = "force-dynamic";

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

  // الطلبات مع بعض (مو ورا بعض): معاينة الفصول (أول فصل + آخر الفصول + العدد) والروايات المشابهة
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

  return (
    <MobileNovelDetail
      novel={novel}
      chapters={chapters}
      chapterTotal={chapterTotal}
      related={related}
    />
  );
}
