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
  const statusLabel = novel.status === "completed" ? "مكتملة" : "مستمرة";

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
          <span className="shrink-0 text-[11px] text-ink-400">
            {novel.author || ""}
          </span>
          <span className="flex flex-wrap items-center justify-end gap-1">
            {cats[0] && (
              <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
                {cats[0]}
              </span>
            )}
            <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
              {statusLabel}
            </span>
            {typeof wordCount === "number" && wordCount > 0 && (
              <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
                {formatCount(wordCount)} حرف
              </span>
            )}
            {tags.map((t) => (
              <span
                key={t}
                className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]"
              >
                {t}
              </span>
            ))}
          </span>
        </span>
      </span>
      {novel.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={novel.cover_url}
          alt={novel.title}
          className="aspect-[0.88] w-[18vw] min-w-[64px] max-w-[92px] shrink-0 rounded object-cover"
        />
      ) : (
        <span className="ph-block aspect-[0.88] w-[18vw] min-w-[64px] max-w-[92px] shrink-0 rounded text-[9px]">
          الغلاف
        </span>
      )}
    </a>
  );
}
