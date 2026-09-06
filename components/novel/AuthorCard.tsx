import type { Novel } from "@/lib/novels";
import { formatCount } from "@/lib/novels";

export default function AuthorCard({
  novel,
  authorNovelsCount,
  totalWordCount,
}: {
  novel: Novel;
  authorNovelsCount: number;
  totalWordCount: number;
}) {
  const authorName = novel.author?.trim() || "كاتب مجهول";

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded bg-white p-3 border border-ink-300/15 text-center sm:w-48 lg:w-56">
      <span className="ph-block flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl">
        🙂
      </span>
      <p className="text-sm font-bold text-ink-900">{authorName}</p>
      <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-ink-500">
        كاتب على المنصة
      </span>

      <div className="mt-1 grid w-full grid-cols-2 gap-2 border-t border-ink-300/15 pt-2 text-[11px]">
        <div>
          <p className="font-bold text-ink-900">{authorNovelsCount}</p>
          <p className="text-ink-300">عدد الأعمال</p>
        </div>
        <div>
          <p className="font-bold text-ink-900">{formatCount(totalWordCount)}</p>
          <p className="text-ink-300">إجمالي الأحرف</p>
        </div>
      </div>
    </div>
  );
}
