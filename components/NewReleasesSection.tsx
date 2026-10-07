import RankingSection, { type RankingListData } from "./RankingSection";
import { getNovels } from "@/lib/novels";
import {
  newReleaseFeatured as placeholderFeatured,
  newReleases as placeholderList,
  newSignedRanking as placeholderRanking,
} from "@/lib/placeholder-data";

export default async function NewReleasesSection() {
  const novels = await getNovels(7);

  const real = novels.map((n) => ({
    id: String(n.id),
    title: n.title,
    category: n.category || "",
    blurb: n.description || "",
    href: `/novel/${n.id}`,
  }));

  const hasReal = real.length > 0;
  const [featured, ...restReal] = hasReal ? real : [];

  const sideRanking: RankingListData = hasReal
    ? {
        id: "latest-added",
        title: "أحدث الإضافات",
        badge: "جديد",
        entries: real.map((n, idx) => ({
          rank: idx + 1,
          title: n.title,
          href: n.href,
        })),
      }
    : placeholderRanking;

  return (
    <section
      aria-labelledby="new-releases-heading"
      className="flex flex-col gap-2 lg:flex-row"
    >
      <div className="flex-1 rounded bg-white p-2.5 border border-ink-300/15">
        <div className="mb-1.5 flex items-center justify-between border-b border-ink-300/20 pb-2">
          <h2
            id="new-releases-heading"
            className="text-sm font-bold text-ink-900"
          >
            إصدارات جديدة
          </h2>
          <a href="#" className="text-[11px] text-ink-500 hover:text-brand">
            المزيد
          </a>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* البطاقة المميزة */}
          <div className="flex gap-2 sm:w-64 sm:shrink-0">
            <span className="ph-block h-28 w-20 shrink-0 rounded text-[11px]">
              الغلاف
            </span>
            <div>
              <p className="mb-1 line-clamp-2 text-sm font-semibold text-ink-900">
                {hasReal ? featured.title : placeholderFeatured.title}
              </p>
              <p className="mb-1 text-[11px] text-ink-300">
                {hasReal ? featured.category : `${placeholderFeatured.author} · ${placeholderFeatured.tag}`}
              </p>
              <p className="mb-1.5 line-clamp-3 text-[11px] text-ink-500">
                {hasReal ? featured.blurb : placeholderFeatured.blurb}
              </p>
              <a
                href={hasReal ? featured.href : "#"}
                className="inline-block rounded bg-brand px-3 py-1 text-[11px] font-medium text-white hover:bg-brand-dark"
              >
                عرض التفاصيل
              </a>
            </div>
          </div>

          {/* الشبكة */}
          <div className="grid flex-1 grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2">
            {hasReal
              ? restReal.map((n) => (
                  <a
                    key={n.id}
                    href={n.href}
                    className="flex gap-2 rounded p-1 hover:bg-surface"
                  >
                    <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
                      الغلاف
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 block text-sm font-semibold text-ink-900">
                        {n.title}
                      </span>
                      {n.category && (
                        <span className="mb-1 flex flex-wrap items-center gap-1 text-[10px] text-ink-300">
                          <span className="rounded bg-surface px-1 text-ink-500">
                            {n.category}
                          </span>
                        </span>
                      )}
                      <span className="line-clamp-2 block text-[11px] text-ink-500">
                        {n.blurb}
                      </span>
                    </span>
                  </a>
                ))
              : placeholderList.map((b) => (
                  <a
                    key={b.id}
                    href="#"
                    className="flex gap-2 rounded p-1 hover:bg-surface"
                  >
                    <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
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
        <RankingSection list={sideRanking} />
      </div>
    </section>
  );
}
