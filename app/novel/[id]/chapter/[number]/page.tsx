import { getNovelById, getChapterByNumber } from "@/lib/novels";
import { notFound } from "next/navigation";
import ChapterPageClient from "@/components/chapter/ChapterPageClient";
import MobileChapterReader from "@/components/chapter/MobileChapterReader";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; number: string }>;
}) {
  const { id, number } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  const chapter = await getChapterByNumber(id, number);

  if (!chapter) {
    notFound();
  }

  const currentNumber = Number(number);

  return (
    <>
      {/* النسخة النظيفة — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileChapterReader
          novel={novel}
          chapter={chapter}
          prevNumber={currentNumber - 1}
          nextNumber={currentNumber + 1}
        />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden sm:block">
        <ChapterPageClient
          novel={novel}
          chapter={chapter}
          prevNumber={currentNumber - 1}
          nextNumber={currentNumber + 1}
        />
      </div>
    </>
  );
}
