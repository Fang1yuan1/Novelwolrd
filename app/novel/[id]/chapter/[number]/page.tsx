import {
  getAdjacentChapterNumbers,
  getChapterByNumber,
  getNovelById,
} from "@/lib/novels";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; number: string }>;
}) {
  const { id, number } = await params;
  const chapterNumber = Number(number);

  const [novel, chapter] = await Promise.all([
    getNovelById(id),
    getChapterByNumber(id, chapterNumber),
  ]);

  if (!novel || !chapter) {
    notFound();
  }

  const { prev, next } = await getAdjacentChapterNumbers(id, chapterNumber);
  const wordCount = chapter.content?.length || 0;
  const publishedDate = new Date(chapter.created_at).toLocaleDateString("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface pb-20">
      <main className="mx-auto flex max-w-3xl flex-col gap-3 px-3 py-4">
        {/* شريط تنقل علوي */}
        <nav className="flex flex-wrap items-center gap-1 text-[11px] text-ink-500">
          <a href="/" className="hover:text-brand">
            الرئيسية
          </a>
          <span className="text-ink-300">/</span>
          <a href={`/novel/${novel.id}`} className="hover:text-brand">
            {novel.title}
          </a>
          <span className="text-ink-300">/</span>
          <span className="text-ink-700">الفصل {chapter.chapter_number}</span>
        </nav>

        {/* بطاقة الفصل */}
        <article className="rounded bg-white p-4 border border-ink-300/15 sm:p-6">
          <h1 className="mb-3 text-xl font-bold text-ink-900 sm:text-2xl">
            {chapter.title
              ? `الفصل ${chapter.chapter_number} — ${chapter.title}`
              : `الفصل ${chapter.chapter_number}`}
          </h1>

          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink-300/15 pb-4 text-[12px] text-ink-500">
            <a
              href={`/novel/${novel.id}`}
              className="flex items-center gap-1 hover:text-brand"
            >
              📖 {novel.title}
            </a>
            {novel.author && <span>✍️ {novel.author}</span>}
            <span>📝 {wordCount} حرف</span>
            <span>🕐 {publishedDate}</span>
          </div>

          {/* محتوى الفصل */}
          <div className="whitespace-pre-line text-[16px] leading-loose text-ink-900 sm:text-[17px]">
            {chapter.content}
          </div>
        </article>

        {/* دعم الفصل */}
        <div className="flex flex-col items-center gap-3 rounded bg-white p-4 border border-ink-300/15 text-center">
          <button
            type="button"
            className="rounded-full bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            💝 ادعم هذا الفصل
          </button>
          <p className="text-[11px] text-ink-300">
            لا يوجد داعمون لهذا الفصل بعد — كن أول من يدعم الكاتب.
          </p>
          <div className="mt-1 flex items-center gap-1.5 rounded-full border border-ink-300/30 px-3 py-1.5 text-[12px] text-ink-500">
            📱 امسح لمتابعة القراءة من جوالك
          </div>
        </div>

        {/* أزرار التنقل العلوية (احتياطية فوق الشريط الثابت) */}
        <div className="grid grid-cols-3 gap-2 text-center text-[13px]">
          {prev ? (
            <a
              href={`/novel/${novel.id}/chapter/${prev}`}
              className="rounded border border-ink-300/30 bg-white py-2 text-ink-700 hover:border-brand hover:text-brand"
            >
              ← الفصل السابق
            </a>
          ) : (
            <span className="rounded border border-ink-300/15 bg-white py-2 text-ink-300">
              ← الفصل السابق
            </span>
          )}
          <a
            href={`/novel/${novel.id}#toc`}
            className="rounded border border-ink-300/30 bg-white py-2 text-ink-700 hover:border-brand hover:text-brand"
          >
            📑 الفهرس
          </a>
          {next ? (
            <a
              href={`/novel/${novel.id}/chapter/${next}`}
              className="rounded border border-ink-300/30 bg-white py-2 text-ink-700 hover:border-brand hover:text-brand"
            >
              الفصل التالي →
            </a>
          ) : (
            <span className="rounded border border-ink-300/15 bg-white py-2 text-ink-300">
              الفصل التالي →
            </span>
          )}
        </div>
      </main>

      {/* شريط تنقل ثابت أسفل الشاشة */}
      <div className="fixed inset-x-0 bottom-0 border-t border-ink-300/15 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-3 py-2 text-center text-[13px]">
          {prev ? (
            <a
              href={`/novel/${novel.id}/chapter/${prev}`}
              className="rounded py-1.5 text-ink-700 hover:text-brand"
            >
              ← السابق
            </a>
          ) : (
            <span className="rounded py-1.5 text-ink-300">← السابق</span>
          )}
          <a
            href={`/novel/${novel.id}#toc`}
            className="rounded bg-brand/10 py-1.5 font-medium text-brand"
          >
            الفهرس
          </a>
          {next ? (
            <a
              href={`/novel/${novel.id}/chapter/${next}`}
              className="rounded py-1.5 text-ink-700 hover:text-brand"
            >
              التالي →
            </a>
          ) : (
            <span className="rounded py-1.5 text-ink-300">التالي →</span>
          )}
        </div>
      </div>
    </div>
  );
}
