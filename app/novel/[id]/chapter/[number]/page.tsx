import { getNovelById, getChapterByNumber, getAdjacentChapterNumbers } from "@/lib/novels";
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
  // الرواية والفصل مع بعض (مو ورا بعض) — نص الطلب الزمني
  const [novel, chapter] = await Promise.all([
    getNovelById(id),
    getChapterByNumber(id, number),
  ]);

  if (!novel || !chapter) {
    notFound();
  }

  const currentNumber = Number(number);
  // أقرب رقم فصل موجود فعلاً قبل/بعد الحالي (مو current±1) — عشان الفصول المرقّمة
  // بكسر (644.5) ما تنتقّى بالتنقّل بين الفصول
  const { prev: prevNumber, next: nextNumber } = await getAdjacentChapterNumbers(id, currentNumber);

  return (
    <>
      {/* النسخة النظيفة — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileChapterReader
          novel={novel}
          chapter={chapter}
          prevNumber={prevNumber}
          nextNumber={nextNumber}
        />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden sm:block">
        <ChapterPageClient
          novel={novel}
          chapter={chapter}
          prevNumber={prevNumber}
          nextNumber={nextNumber}
        />
      </div>
    </>
  );
}
