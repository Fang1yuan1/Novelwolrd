import RankingSection from "./RankingSection";
import {
  newReleaseFeatured,
  newReleases,
  newSignedRanking,
} from "@/lib/placeholder-data";

export default function NewReleasesSection() {
  return (
    <section
      aria-labelledby="new-releases-heading"
      className="flex flex-col gap-3 lg:flex-row"
    >
      <div className="flex-1 rounded-md bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2
            id="new-releases-heading"
            className="text-base font-bold text-ink-900"
          >
            إصدارات جديدة
          </h2>
          <a href="#" className="text-xs text-ink-500 hover:text-brand">
            المزيد
          </a>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {/* البطاقة المميزة */}
          <div className="flex gap-3 sm:w-64 sm:shrink-0">
            <span className="ph-block h-36 w-24 shrink-0 rounded text-xs">
              الغلاف
            </span>
            <div>
              <p className="mb-1 line-clamp-2 text-sm font-semibold text-ink-900">
                {newReleaseFeatured.title}
              </p>
              <p className="mb-1 text-[11px] text-ink-300">
                {newReleaseFeatured.author} · {newReleaseFeatured.tag}
              </p>
              <p className="mb-2 text-[11px] font-medium text-brand">
                {newReleaseFeatured.stat}
              </p>
              <p className="mb-3 line-clamp-3 text-xs text-ink-500">
                {newReleaseFeatured.blurb}
              </p>
              <a
                href="#"
                className="inline-block rounded bg-brand px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-dark"
              >
                عرض التفاصيل
              </a>
            </div>
          </div>

          {/* الشبكة */}
          <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {newReleases.map((b) => (
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
        <RankingSection list={newSignedRanking} />
      </div>
    </section>
  );
}
