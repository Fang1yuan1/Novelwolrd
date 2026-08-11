import type { Novel } from "@/lib/novels";

export default function AuthorCard({
  novel,
  novelCount,
}: {
  novel: Novel;
  novelCount: number;
}) {
  const authorName = novel.author?.trim() || "كاتب مجهول";

  return (
    <div className="flex w-full flex-col items-center gap-2 rounded bg-white p-3 border border-ink-300/15 text-center sm:w-48 lg:w-56">
      <span className="ph-block h-14 w-14 shrink-0 rounded-full text-[11px]">
        🙂
      </span>
      <p className="text-sm font-bold text-ink-900">{authorName}</p>
      <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-ink-500">
        كاتب على المنصة
      </span>

      <div className="mt-1 grid w-full grid-cols-1 gap-1 border-t border-ink-300/15 pt-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-ink-300">عدد الأعمال</span>
          <b className="text-ink-900">{novelCount}</b>
        </div>
      </div>
    </div>
  );
}
