import RankingSection from "./RankingSection";
import {
  completedFeatured,
  completedRanking,
  completedTotal,
  completedWorks,
} from "@/lib/placeholder-data";

export default function CompletedWorksSection() {
  return (
    <section
      aria-labelledby="completed-heading"
      className="flex flex-col gap-3 lg:flex-row"
    >
      <div className="flex-1 rounded-md bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between border-b border-ink-300/20 pb-2">
          <h2
            id="completed-heading"
            className="flex items-baseline gap-2 text-base font-bold text-ink-900"
          >
            أعمال مكتملة مميزة
            <span className="text-xs font-normal text-ink-300">
              {completedTotal}
            </span>
          </h2>
          <a href="#" className="text-xs text-ink-500 hover:text-brand">
            المزيد
          </a>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* البطاقة المميزة */}
          <div className="sm:w-52 sm:shrink-0">
            <span className="ph-block mb-2 block aspect-[3/4] w-full rounded text-xs">
              الغلاف
            </span>
            <p className="mb-1 line-clamp-1 text-sm font-semibold text-ink-900">
              {completedFeatured.title}
            </p>
            <p className="mb-1 text-[11px] text-brand">
              {completedFeatured.tag}
            </p>
            <p className="mb-2 text-[11px] text-ink-300">
              {completedFeatured.stat}
            </p>
            <p className="mb-3 line-clamp-3 text-xs text-ink-500">
              {completedFeatured.blurb}
            </p>
            <a
              href="#"
              className="inline-block rounded bg-brand px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-dark"
            >
              عرض التفاصيل
            </a>
          </div>

          {/* الشبكة */}
          <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {completedWorks.map((b) => (
              <a
                key={b.id}
                href="#"
                className="flex gap-2 rounded p-1 hover:bg-surface"
              >
                <span className="ph-block h-20 w-16 shrink-0 rounded text-[10px]">
                  الغلاف
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 block text-sm font-semibold text-ink-900">
                    {b.title}
                  </span>
                  <span className="mb-1 flex flex-wrap items-center gap-1 text-[10px] text-ink-300">
                    <span>{b.author}</span>
                    <span className="rounded bg-surface px-1 text-ink-500">
                      {b.category}
                    </span>
                    <span className="rounded bg-brand/10 px-1 text-brand">
                      {b.tag}
                    </span>
                  </span>
                  <span className="line-clamp-2 block text-[11px] text-ink-500">
                    {b.blurb}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:w-72 lg:shrink-0">
        <RankingSection list={completedRanking} />
      </div>
    </section>
  );
}
