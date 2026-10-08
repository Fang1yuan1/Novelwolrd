import { getNovelById, getChapterByNumber, getAdjacentChapterNumbers } from "@/lib/novels";
import { notFound } from "next/navigation";
import MobileChapterReader from "@/components/chapter/MobileChapterReader";
import { getServerDeviceKind } from "@/lib/device-server";

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

  // نوع الجهاز الحقيقي من الـUser-Agent (مو من عرض الشاشة) — ثابت حتى لو تغيّر حجم النافذة
  const deviceKind = await getServerDeviceKind();

  // صفحة القراءة واحدة لكل الأجهزة (جوال/آيباد/لابتوب) — نسخة الجوال
  return (
    <MobileChapterReader
      novel={novel}
      chapter={chapter}
      prevNumber={prevNumber}
      nextNumber={nextNumber}
      deviceKind={deviceKind}
    />
  );
}
