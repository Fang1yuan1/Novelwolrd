import type { Novel } from "@/lib/novels";
import { getChapterByNumber } from "@/lib/novels";

function IconFlame() {
  return (
    <svg
      viewBox="0 0 100 130"
      className="h-[14px] w-[14px] shrink-0 fill-ink-500"
      aria-hidden
    >
      <path d="M50 4c6 18-10 24-10 40 0 10 8 16 8 16s-18-4-18-24c0-8 4-14 4-14s-16 10-16 34c0 24 18 40 40 40s40-18 40-38c0-22-14-32-14-32s6 12 2 22c-3 8-10 12-10 12s10-8 10-22C86 20 62 12 50 4z" />
    </svg>
  );
}

// قسم «معاينة الفصل الأول» بأسفل صفحة تفاصيل الرواية (نسخة الهاتف) — مطابق لتصميم
// قسم «章节试读» بموقع Qidian: شريط تبويبات، سطر «نقاش نشط» بأيقونة نار، عنوان الفصل،
// أول فقرات من نصه بارتفاع محدود مع تعتيم تدريجي بالأسفل، وزر «متابعة القراءة».
export default async function MobileChapterTrialRead({ novel }: { novel: Novel }) {
  const chapter = await getChapterByNumber(novel.id, 1);
  if (!chapter || !chapter.content) return null;

  const paragraphs = chapter.content
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="mt-2 bg-white px-3 py-3">
      {/* شريط التبويبات الثلاثة */}
      <div className="mb-2 flex items-center gap-4 border-b border-ink-300/10 pb-2">
        <span className="relative text-[15px] font-bold text-ink-900">
          فصل تجريبي
          <span
            aria-hidden
            className="absolute -left-1.5 -top-0.5 h-[7px] w-[3px] -rotate-[25deg] rounded-full bg-brand"
          />
        </span>
        <span className="text-[15px] text-ink-300">أعمال ذات صلة</span>
        <span className="text-[15px] text-ink-300">توصيات مانجا</span>
      </div>

      {/* سطر النقاش */}
      <div className="mb-3 flex items-center gap-1.5">
        <IconFlame />
        <span className="text-[12px] text-ink-300">نقاش نشط حول هذا الفصل</span>
      </div>

      <h3 className="mb-3 text-[19px] font-bold text-ink-900">
        الفصل {chapter.chapter_number}
        {chapter.title ? ` — ${chapter.title}` : ""}
      </h3>

      <div className="relative max-h-64 overflow-hidden">
        <div className="flex flex-col gap-3 text-[17px] leading-8 text-ink-900">
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
