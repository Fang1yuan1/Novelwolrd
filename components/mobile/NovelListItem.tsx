import type { Novel } from "@/lib/novels";
import { parseCategories, formatCount } from "@/lib/novels";

const statusLabel: Record<string, string> = {
  completed: "مكتملة",
  ongoing: "مستمرة",
};

export default function NovelListItem({
  novel,
  wordCount,
  extraTag,
}: {
  novel: Novel;
  wordCount?: number;
  extraTag?: string;
}) {
  const cats = parseCategories(novel.category);
  const status = novel.status ? statusLabel[novel.status] || novel.status : null;

  return (
    <a href={`/novel/${novel.id}`} className="flex items-start gap-3 text-right">
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[14px] font-bold text-ink-900">
          {novel.title}
        </span>
        {novel.description && (
          <span className="line-clamp-2 mt-1 block text-[12px] leading-relaxed text-ink-500">
            {novel.description}
          </span>
        )}
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-400">
          {extraTag && (
            <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
              {extraTag}
            </span>
          )}
          {status && (
            <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
              {status}
            </span>
          )}
          {cats[0] && (
            <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
              {cats[0]}
            </span>
          )}
          {typeof wordCount === "number" && wordCount > 0 && (
            <span>{formatCount(wordCount)} حرف</span>
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
