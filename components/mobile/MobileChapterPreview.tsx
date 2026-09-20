import type { Chapter, Novel } from "@/lib/novels";

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// قسم "الفهرس" بصفحة تفاصيل الرواية: الضغط على العنوان يفتح صفحة الفهرس الكاملة (/novel/[id]/toc)
export default function MobileChapterPreview({
  novel,
  chapters,
}: {
  novel: Novel;
  chapters: Chapter[];
}) {
  const previewCount = 3;
  const recentFirst = [...chapters].reverse();
  const preview = recentFirst.slice(0, previewCount);
  const firstChapter = chapters[0];

  return (
    <section className="border-t border-ink-300/10 bg-white px-3 py-3">
      <a
        href={`/novel/${novel.id}/toc`}
        aria-label="عرض فهرس الفصول"
        className="mb-2 flex items-center justify-between"
      >
        <h2 className="text-[18px] font-bold text-ink-900">الفهرس</h2>
        <span
          aria-hidden
          className="-ml-3 px-3 py-1 text-[18px] leading-none text-ink-300"
        >
          ‹
        </span>
      </a>

      {chapters.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-ink-300">
          لم تُرفع فصول لهذا العمل بعد.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {preview.map((ch, i) => (
            <li key={ch.id}>
              <a
                href={`/novel/${novel.id}/chapter/${ch.chapter_number}`}
                className="block"
              >
                <p
                  className={
                    i === 0
                      ? "line-clamp-1 text-[16px] font-bold text-ink-900"
                      : "line-clamp-1 text-[15px] text-ink-700"
                  }
                >
                  {i === 0 ? "أحدث فصل — " : ""}
                  {ch.chapter_number}
                  {ch.title ? `، ${ch.title}` : ""}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-300">
                  {formatDate(ch.created_at)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}

      {firstChapter && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled
            title="التحميل غير متاح حاليًا"
            className="rounded-full border border-brand/30 px-4 py-2.5 text-[13px] font-medium text-brand/40"
          >
            تحميل
          </button>
          <a
            href={`/novel/${novel.id}/chapter/${firstChapter.chapter_number}`}
            className="flex-1 rounded-full bg-brand py-2.5 text-center text-sm font-bold text-white"
          >
            ابدأ القراءة
          </a>
        </div>
      )}
    </section>
  );
}
