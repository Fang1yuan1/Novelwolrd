import type { Chapter, Novel } from "@/lib/novels";
import {
  formatCount,
  formatRelativeTime,
  getNovelRank,
  getWordCount,
  parseCategories,
} from "@/lib/novels";
import LaurelIcon from "./LaurelIcon";

export default async function MobileNovelHero({
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
  const rank = await getNovelRank(novel.id);

  return (
    <div className="relative overflow-hidden bg-ink-900">
      {novel.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.cover_url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" />

      <div className="relative flex gap-3 px-3 pb-4 pt-4">
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
          <h1 className="line-clamp-2 text-lg font-bold leading-snug">
            {novel.title}
          </h1>
          {novel.author && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px]">
              <span className="text-[#7fa8ff]">{novel.author}</span>
            </p>
          )}
          <p className="mt-1.5 text-[12px] text-white/60">
            {categories[0] || "بدون تصنيف"}
            {categories[1] ? ` · ${categories[1]}` : ""}
          </p>
          <p className="mt-1 text-[12px] text-white/60">
            {statusLabel}
            {lastChapter && (
              <span className="text-white/40">
                {" "}
                | تحديث {formatRelativeTime(lastChapter.created_at)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="relative flex border-t border-white/10 text-white">
        <div className="flex-1 py-3 text-center">
          {rank ? (
            <>
              <p className="flex items-center justify-center gap-1.5 text-[15px] font-bold text-[#c9a86a]">
                <LaurelIcon />
                رقم {rank.rank}
                <LaurelIcon flip />
              </p>
              <p className="mt-0.5 text-[10px] text-white/50">
                من {rank.total} حسب الفصول
              </p>
            </>
          ) : (
            <p className="text-[11px] text-white/40">لا يوجد ترتيب بعد</p>
          )}
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 py-3 text-center">
          <p className="text-[15px] font-bold">{formatCount(wordCount)}</p>
          <p className="mt-0.5 text-[10px] text-white/50">إجمالي الأحرف</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex-1 py-3 text-center">
          <p className="text-[15px] font-bold">{chapters.length}</p>
          <p className="mt-0.5 text-[10px] text-white/50">فصل</p>
        </div>
      </div>
    </div>
  );
}
