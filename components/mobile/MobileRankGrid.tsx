import { getNovels } from "@/lib/novels";

export default async function MobileRankGrid() {
  const all = await getNovels();
  const items = all.slice(0, 10);

  if (items.length === 0) return null;

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <h2>الترتيب الأسبوعي</h2>
        <a href="/rankings">المزيد ‹</a>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
        {items.map((n, i) => {
          const rank = i + 1;
          const isTop3 = rank <= 3;
          return (
            <li key={n.id}>
              <a href={`/novel/${n.id}`} className="flex items-center gap-2.5">
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="h-12 w-9 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="ph-block h-12 w-9 shrink-0 rounded text-[8px]">
                    ​
                  </span>
                )}
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white ${
                    isTop3 ? "bg-[#e5353e]" : "bg-[#c7c7ca]"
                  }`}
                >
                  {rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[13px] font-semibold text-ink-900">
                    {n.title}
                  </span>
                  <span className="line-clamp-1 block text-[11px] text-ink-400">
                    {n.author || "—"}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
