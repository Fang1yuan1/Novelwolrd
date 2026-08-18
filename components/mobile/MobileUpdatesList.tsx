import { getLatestUpdates, formatRelativeTime } from "@/lib/novels";

export default async function MobileUpdatesList() {
  const updates = await getLatestUpdates(8);

  if (updates.length === 0) return null;

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <h2 className="mb-2 text-[15px] font-bold text-ink-900">
        آخر التحديثات
      </h2>
      <ul className="divide-y divide-ink-300/10">
        {updates.map((u) => (
          <li key={u.chapter_id} className="flex items-center gap-2 py-2">
            <a
              href={`/novel/${u.novel_id}`}
              className="line-clamp-1 flex-1 text-[13px] font-medium text-ink-900"
            >
              {u.novel_title}
            </a>
            <a
              href={`/novel/${u.novel_id}/chapter/${u.chapter_number}`}
              className="line-clamp-1 max-w-[35%] shrink-0 text-[12px] text-ink-500"
            >
              ف.{u.chapter_number}
            </a>
            <span className="shrink-0 text-[11px] text-ink-300">
              {formatRelativeTime(u.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
