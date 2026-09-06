import type { Novel } from "@/lib/novels";

export default function AuthorOtherWorksCard({
  novels,
  authorName,
}: {
  novels: Novel[];
  authorName: string;
}) {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <h2 className="mb-2 border-b border-ink-300/20 pb-2 text-[13px] font-bold text-ink-900">
        أعمال أخرى لـ {authorName}
      </h2>

      {novels.length === 0 ? (
        <p className="py-3 text-center text-[12px] text-ink-300">
          لا توجد أعمال أخرى لهذا الكاتب على المنصة حاليًا.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {novels.map((n) => (
            <li key={n.id}>
              <a
                href={`/novel/${n.id}`}
                className="flex items-center gap-2 rounded p-1 hover:bg-surface"
              >
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="h-14 w-10 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="ph-block flex h-14 w-10 shrink-0 items-center justify-center rounded text-[10px]">
                    غلاف
                  </span>
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-[12px] font-medium text-ink-900 hover:text-brand">
                    {n.title}
                  </span>
                  {n.description && (
                    <span className="line-clamp-1 block text-[11px] text-ink-300">
                      {n.description}
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
