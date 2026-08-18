import type { Novel } from "@/lib/novels";

export default function MobileRelatedNovels({
  novels,
  category,
}: {
  novels: Novel[];
  category: string | null;
}) {
  if (novels.length === 0) return null;

  const mainCategory = category?.split(",")[0]?.trim();

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <h2 className="mb-2 text-[15px] font-bold text-ink-900">
        قد يعجبك أيضًا{mainCategory ? ` · ${mainCategory}` : ""}
      </h2>
      <div className="scroll-thin flex gap-2 overflow-x-auto">
        {novels.map((n) => (
          <a
            key={n.id}
            href={`/novel/${n.id}`}
            className="flex w-24 shrink-0 flex-col gap-1"
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
            <span className="line-clamp-2 text-[11px] text-ink-700">
              {n.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
