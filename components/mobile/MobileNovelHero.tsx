import type { Chapter, Novel } from "@/lib/novels";
import {
  formatCount,
  formatRelativeTime,
  getWordCount,
  parseCategories,
} from "@/lib/novels";

export default function MobileNovelHero({
  novel,
  chapters,
}: {
  novel: Novel;
  chapters: Chapter[];
}) {
  const lastChapter = chapters[chapters.length - 1];
  const wordCount = getWordCount(chapters);
  const categories = parseCategories(novel.category);
  const statusLabel = novel.status === "completed" ? "مكتملة" : "مستمرة";

  return (
    <div className="relative overflow-hidden bg-ink-900">
      {novel.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.cover_url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
        />
      )}

      <div className="relative flex gap-3 px-3 pb-4 pt-3">
        {novel.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={novel.cover_url}
            alt={novel.title}
            className="aspect-[3/4] w-24 shrink-0 rounded object-cover shadow-lg"
          />
        ) : (
          <span className="ph-block aspect-[3/4] w-24 shrink-0 rounded text-[10px]">
            الغلاف
          </span>
        )}
        <div className="min-w-0 flex-1 pt-1 text-white">
          <h1 className="line-clamp-2 text-lg font-bold">{novel.title}</h1>
          {novel.author && (
            <p className="mt-1 text-[13px] text-white/70">{novel.author}</p>
          )}
          <p className="mt-1 text-[12px] text-white/60">
            {categories[0] || "بدون تصنيف"} · {statusLabel}
          </p>
          {lastChapter && (
            <p className="mt-1 text-[11px] text-white/50">
              آخر تحديث: {formatRelativeTime(lastChapter.created_at)}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex border-t border-white/10 text-white">
        <div className="flex-1 py-2.5 text-center">
          <p className="text-sm font-bold">{formatCount(wordCount)}</p>
          <p className="text-[10px] text-white/50">حرف</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 py-2.5 text-center">
          <p className="text-sm font-bold">{chapters.length}</p>
          <p className="text-[10px] text-white/50">فصل</p>
        </div>
      </div>
    </div>
  );
}
