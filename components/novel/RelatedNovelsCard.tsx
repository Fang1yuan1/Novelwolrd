import type { Novel } from "@/lib/novels";

export default function RelatedNovelsCard({
  novels,
  category,
}: {
  novels: Novel[];
  category: string | null;
}) {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2 className="text-[13px] font-bold text-ink-900">
          روايات مقترحة{category ? ` · ${category}` : ""}
        </h2>
        <a href="/" className="text-[11px] text-ink-500 hover:text-brand">
          المزيد
        </a>
      </div>

      {novels.length === 0 ? (
        <p className="py-2 text-center text-[11px] text-ink-300">
          لا توجد روايات أخرى في نفس التصنيف حاليًا.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {novels.map((n) => (
            <li key={n.id}>
              <a
                href={`/novel/${n.id}`}
                className="flex gap-2 rounded p-1 hover:bg-surface"
              >
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="h-14 w-11 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="ph-block h-14 w-11 shrink-0 rounded text-[9px]">
                    الغلاف
                  </span>
                )}
                <span className="min-w-0">
                  <span className="line-clamp-1 block text-[12px] font-semibold text-ink-900">
                    {n.title}
                  </span>
                  <span className="line-clamp-2 block text-[11px] text-ink-500">
                    {n.description || "—"}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
