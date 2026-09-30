import type { Novel } from "@/lib/novels";
import { getChapterByNumber } from "@/lib/novels";
import { getTrialReadSettings } from "@/lib/trial-read-settings";
import { splitChapterParagraphs } from "@/lib/chapter-text";
import MobileChapterTrialReadClient from "./MobileChapterTrialReadClient";

// قسم «معاينة الفصل الأول» بأسفل صفحة تفاصيل الرواية (نسخة الهاتف). يجلب بيانات الفصل
// والإعدادات القابلة للتعديل من /admin/trial-read (كلمات وأحجام خطوط) هنا (سيرفر)،
// ويسلّمها لمكوّن العميل اللي يطبّق ثيم/خط/سطوع صفحة القراءة ويوسّع النص بنفس الصفحة.
export default async function MobileChapterTrialRead({ novel }: { novel: Novel }) {
  const [chapter, settings] = await Promise.all([
    getChapterByNumber(novel.id, 1),
    getTrialReadSettings(),
  ]);
  if (!chapter || !chapter.content) return null;

  const paragraphs = splitChapterParagraphs(chapter.content);

  return (
    <MobileChapterTrialReadClient
      novelId={novel.id}
      chapterNumber={chapter.chapter_number}
      chapterTitle={chapter.title}
      paragraphs={paragraphs}
      settings={settings}
    />
  );
}
