"use client";

import { useMemo, useState } from "react";
import type { Novel } from "@/lib/novels";

type RankedNovel = Novel & { wordCount: number; chapterCount: number };

const tabs = [
  { key: "bestseller", label: "الأكثر مبيعاً" },
  { key: "trending", label: "الأكثر تفاعلاً" },
  { key: "newest", label: "الأحدث توقيعاً" },
  { key: "picks", label: "توصياتنا" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function sortForTab(novels: RankedNovel[], tab: TabKey): RankedNovel[] {
  const copy = [...novels];
  switch (tab) {
    case "bestseller":
      return copy.sort((a, b) => b.wordCount - a.wordCount);
    case "trending":
      return copy.sort((a, b) => b.chapterCount - a.chapterCount);
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "picks":
    default:
      return copy;
  }
}

export default function MobileRankTabs({ novels }: { novels: RankedNovel[] }) {
  const [active, setActive] = useState<TabKey>("bestseller");
  const ranked = useMemo(() => sortForTab(novels, active).slice(0, 10), [novels, active]);

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <h2>لوحة الترتيب</h2>
        <a href="/rankings">المزيد ‹</a>
      </div>
      <ul className="scroll-thin mb-3 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <li key={t.key} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                active === t.key
                  ? "bg-[#fce9ea] text-[#e5353e]"
                  : "bg-[#f2f2f3] text-[#5b5b60]"
              }`}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
        {ranked.map((n, i) => {
          const rank = i + 1;
          return (
            <li key={n.id}>
              <a href={`/novel/${n.id}`} className="flex items-center gap-2.5">
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="aspect-[0.72] w-[13vw] min-w-[46px] max-w-[62px] shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="ph-block aspect-[0.72] w-[13vw] min-w-[46px] max-w-[62px] shrink-0 rounded text-[8px]">​</span>
                )}
                {rank <= 3 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/icons/ranks/rank-${rank}.png`}
                    alt={`الترتيب ${rank}`}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                ) : (
                  <span className="w-5 shrink-0 text-center text-[13px] font-bold text-[#9a9a9f]">
                    {rank}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[14px] font-semibold text-ink-900">
                    {n.title}
                  </span>
                  <span className="line-clamp-1 block text-[12px] text-ink-400">
                    {n.author || "—"}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
