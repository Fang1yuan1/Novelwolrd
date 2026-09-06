import { getLatestUpdates, formatRelativeTime } from "@/lib/novels";
import {
  masterAuthors,
  recentFeatured as placeholderFeatured,
  recentUpdates as placeholderUpdates,
} from "@/lib/placeholder-data";

export default async function RecentUpdatesSection() {
  const updates = await getLatestUpdates(20);
  const hasReal = updates.length > 0;

  // أول 3 روايات فريدة من التحديثات الأخيرة للبطاقات المميزة
  const seen = new Set<number>();
  const featuredReal = [] as { id: number; title: string; category: string | null }[];
  for (const u of updates) {
    if (!seen.has(u.novel_id)) {
      seen.add(u.novel_id);
      featuredReal.push({ id: u.novel_id, title: u.novel_title, category: u.novel_category });
    }
    if (featuredReal.length >= 3) break;
  }

  return (
    <section
      aria-labelledby="recent-updates-heading"
      className="flex flex-col gap-2 lg:flex-row"
    >
      {/* البطاقات المميزة */}
      <div className="flex gap-2 overflow-x-auto scroll-thin lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
        {hasReal
          ? featuredReal.map((f) => (
              <a
                key={f.id}
                href={`/novel/${f.id}`}
                className="flex w-64 shrink-0 gap-2 rounded bg-white p-2 border border-ink-300/15 hover:border-ink-300/40 lg:w-full"
              >
                <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
                  الغلاف
                </span>
                <span className="min-w-0">
                  <span className="mb-1 flex items-center gap-1">
                    <span className="line-clamp-1 text-sm font-semibold text-ink-900">
                      {f.title}
                    </span>
                  </span>
                  {f.category && (
                    <span className="mb-1 block text-[10px] font-medium text-brand">
                      {f.category}
                    </span>
                  )}
                </span>
              </a>
            ))
          : placeholderFeatured.map((f) => (
              <a
                key={f.id}
                href="#"
                className="flex w-64 shrink-0 gap-2 rounded bg-white p-2 border border-ink-300/15 hover:border-ink-300/40 lg:w-full"
              >
                <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
                  الغلاف
                </span>
                <span className="min-w-0">
                  <span className="mb-1 flex items-center gap-1">
                    <span className="line-clamp-1 text-sm font-semibold text-ink-900">
                      {f.title}
                    </span>
                  </span>
                  <span className="mb-1 block text-[10px] font-medium text-brand">
                    {f.updateRate}
                  </span>
                  <span className="line-clamp-1 block text-[10px] text-ink-300">
                    {f.author}
                  </span>
                  <span className="line-clamp-2 mt-1 block text-[11px] text-ink-500">
                    {f.blurb}
                  </span>
                </span>
              </a>
            ))}
      </div>

      {/* جدول التحديثات */}
      <div className="flex-1 rounded bg-white p-2.5 border border-ink-300/15">
        <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2
            id="recent-updates-heading"
            className="text-sm font-bold text-ink-900"
          >
            آخر التحديثات
          </h2>
          <a href="#" className="text-[11px] text-ink-500 hover:text-brand">
            كل التحديثات ‹
          </a>
        </div>
        <ul className="divide-y divide-ink-300/10 text-[11px]">
          {hasReal
            ? updates.map((u) => (
                <li
                  key={u.chapter_id}
                  className="flex items-center gap-2 py-1.5 hover:bg-surface"
                >
                  {u.novel_category && (
                    <span className="w-16 shrink-0 text-ink-300">
                      「{u.novel_category}」
                    </span>
                  )}
                  <a
                    href={`/novel/${u.novel_id}`}
                    className="line-clamp-1 w-40 shrink-0 font-medium text-ink-900 hover:text-brand sm:w-48"
                  >
                    {u.novel_title}
                  </a>
                  <a
                    href={`/novel/${u.novel_id}/chapter/${u.chapter_number}`}
                    className="line-clamp-1 min-w-0 flex-1 text-ink-500 hover:text-brand"
                  >
                    ف.{u.chapter_number} {u.chapter_title ? `— ${u.chapter_title}` : ""}
                  </a>
                  <span className="w-12 shrink-0 text-end text-ink-300">
                    {formatRelativeTime(u.created_at)}
                  </span>
                </li>
              ))
            : placeholderUpdates.map((u, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 py-1.5 hover:bg-surface"
                >
                  <span className="w-16 shrink-0 text-ink-300">
                    「{u.category}」
                  </span>
                  <a
                    href="#"
                    className="line-clamp-1 w-40 shrink-0 font-medium text-ink-900 hover:text-brand sm:w-48"
                  >
                    {u.title}
                  </a>
                  <a
                    href="#"
                    className="line-clamp-1 min-w-0 flex-1 text-ink-500 hover:text-brand"
                  >
                    {u.chapter}
                  </a>
                  {u.tag && (
                    <span className="shrink-0 rounded bg-brand px-1 text-[10px] text-white">
                      {u.tag}
                    </span>
                  )}
                  <span className="hidden shrink-0 text-ink-300 sm:inline">
                    {u.author}
                  </span>
                  <span className="w-12 shrink-0 text-end text-ink-300">
                    {u.time}
                  </span>
                </li>
              ))}
        </ul>
      </div>

      {/* نادي كبار المؤلفين — بدون مصدر بيانات حقيقي حاليًا، محتوى تعريفي ثابت */}
      <div className="rounded bg-white p-2.5 border border-ink-300/15 lg:w-72 lg:shrink-0">
        <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2 className="text-sm font-bold text-ink-900">نادي كبار المؤلفين</h2>
          <a href="#" className="text-[11px] text-ink-500 hover:text-brand">
            المزيد
          </a>
        </div>
        <ul className="space-y-3">
          {masterAuthors.map((a) => (
            <li key={a.id} className="flex gap-2">
              <span className="ph-block h-11 w-11 shrink-0 rounded-full text-[10px]">
                🙂
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-ink-900">
                  {a.name}
                </p>
                <p className="mb-1 text-[10px] text-ink-300">{a.role}</p>
                <p className="mb-1 flex flex-wrap gap-1">
                  {a.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-ink-500"
                    >
                      {t}
                    </span>
                  ))}
                </p>
                <p className="line-clamp-2 text-[11px] text-ink-500">
                  {a.bio}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
