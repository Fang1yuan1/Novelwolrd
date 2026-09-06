import type { Chapter, Novel } from "@/lib/novels";
import { formatCount, formatRelativeTime, parseCategories } from "@/lib/novels";

export default function InfoCard({
  novel,
  chapters,
}: {
  novel: Novel;
  chapters: Chapter[];
}) {
  const lastChapter = chapters[chapters.length - 1];
  const wordCount = novel.word_count ?? 0;
  const categories = parseCategories(novel.category);
  const tags = (novel.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const statusLabel =
    novel.status === "completed" ? "مكتملة" : "مستمرة";

  return (
    <div
      id="info"
      className="flex scroll-mt-3 flex-col gap-3 rounded bg-white p-3 border border-ink-300/15 sm:flex-row"
    >
      {novel.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.cover_url}
          alt={novel.title}
          className="aspect-[3/4] w-32 shrink-0 rounded object-cover sm:w-40"
        />
      ) : (
        <span className="ph-block aspect-[3/4] w-32 shrink-0 rounded text-[11px] sm:w-40">
          الغلاف
        </span>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="mb-1 text-xl font-bold text-ink-900">{novel.title}</h1>

        <p className="mb-2 text-[13px] text-ink-500">
          {novel.author && (
            <>
              <span>المؤلف: {novel.author}</span>
              <span className="mx-1.5 text-ink-300">·</span>
            </>
          )}
          {lastChapter ? (
            <span>
              آخر تحديث: {formatRelativeTime(lastChapter.created_at)}
            </span>
          ) : (
            <span>لم يُنشر أي فصل بعد</span>
          )}
        </p>

        {lastChapter && (
          <p className="mb-2 text-[13px] text-ink-500">
            أحدث فصل:{" "}
            <a
              href={`/novel/${novel.id}/chapter/${lastChapter.chapter_number}`}
              className="text-brand hover:underline"
            >
              الفصل {lastChapter.chapter_number}
              {lastChapter.title ? ` — ${lastChapter.title}` : ""}
            </a>
          </p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded bg-surface px-1.5 py-0.5 text-ink-500">
            {statusLabel}
          </span>
          {categories.map((c) => (
            <span
              key={c}
              className="rounded bg-brand/10 px-1.5 py-0.5 text-brand"
            >
              {c}
            </span>
          ))}
          {tags.map((t) => (
            <span
              key={t}
              className="rounded bg-surface px-1.5 py-0.5 text-ink-500"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3 text-[13px] text-ink-700">
          <span>
            <b className="text-ink-900">{formatCount(wordCount)}</b> حرف
          </span>
          <span className="text-ink-300">|</span>
          <span>
            <b className="text-ink-900">{chapters.length}</b> فصل
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastChapter && (
            <a
              href={`/novel/${novel.id}/chapter/${chapters[0]?.chapter_number ?? 1}`}
              className="rounded border border-brand px-3 py-1.5 text-[13px] font-medium text-brand hover:bg-brand/5"
            >
              قراءة تجريبية مجانية
            </a>
          )}
          <button
            type="button"
            className="rounded border border-ink-300/40 px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:border-brand hover:text-brand"
          >
            أضف للمكتبة
          </button>
          <a
            href="#vote"
            className="rounded border border-ink-300/40 px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:border-brand hover:text-brand"
          >
            التصويت التفاعلي
          </a>
        </div>
      </div>
    </div>
  );
}
