import { getNovels } from "@/lib/novels";

export default async function MobileLightNovels() {
  const all = await getNovels();
  const items = all.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <h2>روايات قصيرة</h2>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="scroll-thin flex gap-3 overflow-x-auto pb-1">
        {items.map((n) => (
          <li key={n.id} className="w-[110px] shrink-0">
            <a href={`/novel/${n.id}`} className="block">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="aspect-[0.72] w-full rounded-lg object-cover"
                />
              ) : (
                <span className="ph-block aspect-[0.72] block w-full rounded-lg text-[10px]">
                  الغلاف
                </span>
              )}
              <span className="line-clamp-2 mt-1.5 block text-[12px] font-semibold leading-snug text-ink-900">
                {n.title}
              </span>
              <span className="line-clamp-1 mt-0.5 block text-[11px] text-ink-400">
                {n.author || "—"}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
