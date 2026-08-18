import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileNovelGrid({
  title,
  novels,
  moreHref,
}: {
  title: string;
  novels: Novel[];
  moreHref?: string;
}) {
  if (novels.length === 0) return null;

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
        {moreHref && (
          <a href={moreHref} className="text-[11px] text-ink-300">
            المزيد ‹
          </a>
        )}
      </div>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3">
        {novels.slice(0, 4).map((n) => {
          const categories = parseCategories(n.category);
          return (
            <a
              key={n.id}
              href={`/novel/${n.id}`}
              className="flex flex-col gap-1"
            >
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="aspect-[3/4] w-full rounded object-cover"
                />
              ) : (
                <span className="ph-block aspect-[3/4] w-full rounded text-[10px]">
                  الغلاف
                </span>
              )}
              <span className="line-clamp-2 text-[11px] leading-snug text-ink-700">
                {n.title}
              </span>
              {categories[0] && (
                <span className="line-clamp-1 text-[10px] text-ink-300">
                  {categories[0]}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
