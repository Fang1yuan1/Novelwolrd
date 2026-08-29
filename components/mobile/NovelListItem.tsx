import type { Novel } from "@/lib/novels";
import { parseCategories, formatCount } from "@/lib/novels";

export default function NovelListItem({
  novel,
  wordCount,
}: {
  novel: Novel;
  wordCount?: number;
}) {
  const cats = parseCategories(novel.category);
  const tags = parseCategories(novel.tags).slice(0, 2);

  return (
    <a href={`/novel/${novel.id}`} className="flex items-start gap-3 text-right">
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 block text-[16px] font-bold text-ink-900">
          {novel.title}
        </span>
        {novel.description && (
          <span className="line-clamp-2 mt-1.5 block text-[13px] leading-relaxed text-ink-500">
            {novel.description}
          </span>
        )}
        <span className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[12px] text-ink-400">
            {cats[0]}
            {cats[0] && typeof wordCount === "number" && wordCount > 0 ? " · " : ""}
            {typeof wordCount === "number" && wordCount > 0 && `${formatCount(wordCount)} حرف`}
          </span>
          {tags.length > 0 && (
            <span className="flex shrink-0 items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10.5px] text-[#8a8a8f]"
                >
                  {t}
                </span>
              ))}
            </span>
          )}
        </span>
      </span>
      {novel.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.cover_url}
          alt={novel.title}
          className="h-20 w-14 shrink-0 rounded object-cover"
        />
      ) : (
        <span className="ph-block h-20 w-14 shrink-0 rounded text-[9px]">الغلاف</span>
      )}
    </a>
  );
}
