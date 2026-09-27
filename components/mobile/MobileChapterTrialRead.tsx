import type { Novel } from "@/lib/novels";
import { getChapterByNumber } from "@/lib/novels";
import MobileChapterTrialReadClient from "./MobileChapterTrialReadClient";

// قسم «معاينة الفصل الأول» بأسفل صفحة تفاصيل الرواية (نسخة الهاتف). يجلب بيانات الفصل
// هنا (سيرفر)، ويسلّمها لمكوّن العميل اللي يطبّق ثيم/خط/سطوع صفحة القراءة الفعليين
// ويتحكم بتوسيع النص كامل بنفس الصفحة عند الضغط على «متابعة القراءة».
export default async function MobileChapterTrialRead({ novel }: { novel: Novel }) {
  const chapter = await getChapterByNumber(novel.id, 1);
  if (!chapter || !chapter.content) return null;

  const paragraphs = chapter.content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <MobileChapterTrialReadClient
      novelId={novel.id}
      chapterNumber={chapter.chapter_number}
      chapterTitle={chapter.title}
      paragraphs={paragraphs}
    />
  );
}
