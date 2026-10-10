import { getNovelById, getChapterByNumber, getAdjacentChapterNumbers, getChapterPreview } from "@/lib/novels";
import { notFound, redirect } from "next/navigation";
import ReadingTracker from "@/components/chapter/ReadingTracker";
import MobileChapterReader from "@/components/chapter/MobileChapterReader";

export const revalidate = 86400; // مخزّنة ISR: تُبنى مرة وتُخدم بدون CPU، وتتجدد بالخلفية بعد هذه المدة (ثواني)

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

  // «ابدأ القراءة» يفتح الفصل رقم 1 دائمًا؛ لو الرواية ما فيها فصل بهذا الرقم نحوّل لأول فصل موجود
  if (novel && !chapter && number === "1") {
    const preview = await getChapterPreview(id);
    if (preview.first && preview.first.chapter_number !== 1) {
      redirect(`/novel/${id}/chapter/${preview.first.chapter_number}`);
    }
  }

  if (!novel || !chapter) {
    notFound();
  }

  const currentNumber = Number(number);
  // أقرب رقم فصل موجود فعلاً قبل/بعد الحالي (مو current±1) — عشان الفصول المرقّمة
  // بكسر (644.5) ما تنتقّى بالتنقّل بين الفصول
  const { prev: prevNumber, next: nextNumber } = await getAdjacentChapterNumbers(id, currentNumber);


  // صفحة القراءة واحدة لكل الأجهزة (جوال/آيباد/لابتوب) — نسخة الجوال
  return (
    <>
      <ReadingTracker novelId={novel.id} chapterId={chapter.id} />
      <MobileChapterReader
        novel={novel}
        chapter={chapter}
        prevNumber={prevNumber}
        nextNumber={nextNumber}
      />
    </>
  );
}
