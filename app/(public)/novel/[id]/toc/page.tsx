import { notFound } from "next/navigation";
import MobileTocPage, {
  type TocVolume,
} from "@/components/mobile/MobileTocPage";
import {
  formatChapterStamp,
  getChapterListItems,
  getNovelById,
  groupChaptersByVolume,
} from "@/lib/novels";

export const dynamic = "force-dynamic";

export default async function NovelTocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // الرواية وقائمة فصولها مع بعض (قائمة خفيفة بدون نص الفصول)
  const [novel, chapters] = await Promise.all([
    getNovelById(id),
    getChapterListItems(id),
  ]);

  if (!novel) {
    notFound();
  }

  // التنسيق كله هنا بالسيرفر وللمتصفح بس نصوص جاهزة
  const volumes: TocVolume[] = groupChaptersByVolume(chapters).map((v) => ({
    name: v.volume,
    rows: v.chapters.map((ch) => ({
      id: ch.id,
      number: ch.chapter_number,
      title: ch.title,
      words: ch.word_count,
      stamp: formatChapterStamp(ch.created_at),
    })),
  }));

  return (
    <MobileTocPage
      novelId={novel.id}
      novelTitle={novel.title}
      volumes={volumes}
    />
  );
}
