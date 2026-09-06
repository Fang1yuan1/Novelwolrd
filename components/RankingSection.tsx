export type RankingEntry = { rank: number; title: string; meta?: string; href?: string };
export type RankingListData = { id: string; title: string; badge: string; entries: RankingEntry[] };

export default function RankingSection({ list }: { list: RankingListData }) {
  const [top, ...others] = list.entries;

  if (!top) return null;

  return (
    <div className="rounded bg-white p-2 border border-ink-300/15">
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h3 className="text-sm font-bold text-ink-900">{list.title}</h3>
        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
          {list.badge}
        </span>
      </div>

      {/* المرتبة الأولى بغلاف بارز */}
      <a href={top.href || "#"} className="mb-2 flex gap-2 rounded p-1 hover:bg-surface">
        <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
          الغلاف
        </span>
        <span className="min-w-0">
          <span className="mb-0.5 flex items-center gap-1">
            <span className="rounded bg-brand px-1 text-[10px] font-bold text-white">
              الأول
            </span>
          </span>
          <span className="line-clamp-1 block text-sm font-semibold text-ink-900">
            {top.title}
          </span>
          <span className="line-clamp-1 block text-[11px] text-ink-500">
            {top.meta}
          </span>
        </span>
      </a>

      <ol className="space-y-1 text-[11px]">
        {others.map((e) => (
          <li key={e.rank}>
            <a
              href={e.href || "#"}
              className="flex items-center gap-2 rounded px-1 py-1 hover:bg-surface"
            >
              <span
                className={`w-4 shrink-0 text-center font-semibold ${
                  e.rank <= 3 ? "text-brand" : "text-ink-300"
                }`}
              >
                {e.rank}
              </span>
              <span className="line-clamp-1 flex-1 text-ink-700">
                {e.title}
              </span>
              {e.meta && (
                <span className="shrink-0 text-[10px] text-ink-300">
                  {e.meta}
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>

      <a
        href="#"
        className="mt-2 block text-center text-[11px] text-ink-300 hover:text-brand"
      >
        عرض المزيد ⌄
      </a>
    </div>
  );
}
