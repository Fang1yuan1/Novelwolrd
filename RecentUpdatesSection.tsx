import {
  masterAuthors,
  recentFeatured,
  recentUpdates,
} from "@/lib/placeholder-data";

export default function RecentUpdatesSection() {
  return (
    <section
      aria-labelledby="recent-updates-heading"
      className="flex flex-col gap-3 lg:flex-row"
    >
      {/* البطاقات المميزة */}
      <div className="flex gap-3 overflow-x-auto scroll-thin lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
        {recentFeatured.map((f) => (
          <a
            key={f.id}
            href="#"
            className="flex w-64 shrink-0 gap-2 rounded-md bg-white p-3 shadow-sm hover:shadow-md lg:w-full"
          >
            <span className="ph-block h-20 w-16 shrink-0 rounded text-[10px]">
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
      <div className="flex-1 rounded-md bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2
            id="recent-updates-heading"
            className="text-base font-bold text-ink-900"
          >
            آخر التحديثات
          </h2>
          <a href="#" className="text-xs text-ink-500 hover:text-brand">
            كل التحديثات ‹
          </a>
        </div>
        <ul className="divide-y divide-ink-300/10 text-xs">
          {recentUpdates.map((u, idx) => (
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

      {/* نادي كبار المؤلفين */}
      <div className="rounded-md bg-white p-4 shadow-sm lg:w-72 lg:shrink-0">
        <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2 className="text-sm font-bold text-ink-900">نادي كبار المؤلفين</h2>
          <a href="#" className="text-xs text-ink-500 hover:text-brand">
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
                <p className="flex items-center gap-1 text-xs font-semibold text-ink-900">
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
