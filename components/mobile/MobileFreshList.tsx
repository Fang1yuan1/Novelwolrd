import { getNovels, parseCategories, formatCount, getChaptersByNovel, getWordCount } from "@/lib/novels";

export default async function MobileFreshList() {
  const all = await getNovels();
  const fresh = all.filter((n) => n.status !== "completed").slice(0, 3);

  if (fresh.length === 0) return null;

  const withCounts = await Promise.all(
    fresh.map(async (n) => {
      const chapters = await getChaptersByNovel(n.id);
      return { novel: n, wordCount: getWordCount(chapters) };
    })
  );

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>جديد سريع الانتشار</h2>
          <span className="mobile-reference-badge-pill">جديد آخر 24 ساعة</span>
        </span>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="flex flex-col gap-3">
        {withCounts.map(({ novel: n, wordCount }) => {
          const cats = parseCategories(n.category);
          return (
            <li key={n.id}>
              <a href={`/novel/${n.id}`} className="flex items-start gap-3">
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="h-20 w-14 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="ph-block h-20 w-14 shrink-0 rounded text-[9px]">
                    الغلاف
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[14px] font-bold text-ink-900">
                    {n.title}
                  </span>
                  <span className="line-clamp-2 mt-0.5 block text-[12px] leading-relaxed text-ink-500">
                    {n.description || "—"}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-400">
                    {cats[0] && <span>{cats[0]}</span>}
                    <span className="rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
                      مستمرة
                    </span>
                    {wordCount > 0 && <span>{formatCount(wordCount)} حرف</span>}
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
