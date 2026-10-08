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

  // تحديد الجهاز دقيق من الـUser-Agent الحقيقي بالسيرفر (مش عرض الشاشة) — آيباد ولابتوب
  // ديسكتوب يُعاملوا نفس معاملة بعض: نفس تصميم الجوال، بس بإطار بعرض ثابت متمركز
  // بدل ما يتمدد بكل عرض الشاشة. التفاصيل بـ lib/device-server.ts و lib/device.ts.
  const deviceKind = await getServerDeviceKind();
  const isPhone = deviceKind === "phone";

  const reader = (
    <MobileChapterReader
      novel={novel}
      chapter={chapter}
      prevNumber={prevNumber}
      nextNumber={nextNumber}
    />
  );

  if (isPhone) return reader;

  // آيباد/لابتوب: نفس الصفحة بالضبط، داخل إطار بعرض جوال ثابت ومتمركز بالنص.
  // مهم: --u (وحدة القياس المستخدمة بكل مقاسات الصفحة والشيتات) مبنية أصلاً على
  // 100vw الفعلي (عرض الشاشة الحقيقي)، فلازم نحددها هنا صراحة بعرض الإطار (480)
  // وإلا كل شيء جوّه الإطار يتحسب على عرض الشاشة الكبير مش عرض الإطار الصغير.
  return (
    <div className="min-h-screen bg-[#e5e5e5]">
      <div
        className="mx-auto min-h-screen w-full max-w-[480px] bg-surface shadow-[0_0_40px_rgba(0,0,0,0.12)]"
        style={{ ["--u" as string]: "calc(480px / 828)" }}
      >
        {reader}
      </div>
    </div>
  );
}
