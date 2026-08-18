import { getNovels } from "@/lib/novels";

export default async function MobileCompletedList() {
  const all = await getNovels();
  const completed = all.filter((n) => n.status === "completed").slice(0, 6);

  if (completed.length === 0) return null;

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <h2 className="mb-2 text-[15px] font-bold text-ink-900">
        أعمال مكتملة
      </h2>
      <ul className="flex flex-col gap-3">
        {completed.map((n) => (
          <li key={n.id}>
            <a href={`/novel/${n.id}`} className="flex items-center gap-2">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.cover_url}
                  alt={n.title}
                  className="h-16 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="ph-block h-16 w-12 shrink-0 rounded text-[9px]">
                  الغلاف
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block text-[13px] font-semibold text-ink-900">
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
    </section>
  );
}
