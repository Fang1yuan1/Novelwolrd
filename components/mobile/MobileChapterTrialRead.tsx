import type { Novel } from "@/lib/novels";
import { getChapterByNumber } from "@/lib/novels";

// قسم «معاينة الفصل الأول» بأسفل صفحة تفاصيل الرواية (نسخة الهاتف) — مطابق لتصميم
// قسم «章节试读» بموقع Qidian: عنوان الفصل، أول فقرات من نصه بارتفاع محدود مع تعتيم
// تدريجي بالأسفل، وزر «متابعة القراءة» يفتح صفحة الفصل الكاملة.
export default async function MobileChapterTrialRead({ novel }: { novel: Novel }) {
  const chapter = await getChapterByNumber(novel.id, 1);
  if (!chapter || !chapter.content) return null;

  const paragraphs = chapter.content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <div className="mb-3 flex items-center gap-4 border-b border-ink-300/10 pb-2">
        <h2 className="text-[15px] font-bold text-ink-900">فصل تجريبي</h2>
      </div>

      <h3 className="mb-3 text-[17px] font-bold text-ink-900">
        الفصل {chapter.chapter_number}
        {chapter.title ? ` — ${chapter.title}` : ""}
      </h3>

      <div className="relative max-h-64 overflow-hidden">
        <div className="flex flex-col gap-3 text-[15px] leading-8 text-ink-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {/* تعتيم تدريجي يخفي نهاية النص، زي معاينة Qidian */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      <a
        href={`/novel/${novel.id}/chapter/${chapter.chapter_number}`}
        className="mx-auto mt-2 flex w-40 items-center justify-center gap-1 rounded-full border border-ink-300/30 py-2 text-[13px] text-ink-500"
      >
        متابعة القراءة
        <span aria-hidden className="text-[10px]">
          ⌄
        </span>
      </a>
    </section>
  );
}
