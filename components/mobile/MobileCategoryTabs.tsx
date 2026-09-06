"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileCategoryTabs({
  categories,
  novels,
}: {
  categories: string[];
  novels: Novel[];
}) {
  const [active, setActive] = useState(categories[0] || "");

  const filtered = novels
    .filter((n) => parseCategories(n.category).includes(active))
    .slice(0, 10);

  if (categories.length === 0) return null;

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>توصيات حسب التصنيف</h2>
          <span className="mobile-reference-badge-pill">اختيار المحرر</span>
        </span>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="scroll-thin flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <li key={c} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(c)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                active === c
                  ? "bg-[#fce9ea] text-[#e5353e]"
                  : "bg-[#f2f2f3] text-[#5b5b60]"
              }`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>
      <ul className="scroll-thin mt-3 flex gap-2.5 overflow-x-auto pb-1">
        {filtered.map((n) => {
          const cats = parseCategories(n.category);
          return (
            <li key={n.id} className="w-[86px] shrink-0">
              <a href={`/novel/${n.id}`} className="block">
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="aspect-[0.72] w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="ph-block aspect-[0.72] block w-full rounded-lg text-[10px]">
                    الغلاف
                  </span>
                )}
                <span className="line-clamp-2 mt-1.5 block text-[11px] font-semibold leading-snug text-ink-900">
                  {n.title}
                </span>
                <span className="line-clamp-1 mt-0.5 block text-[10px] text-ink-400">
                  {cats.length > 0 ? cats.slice(0, 2).join(" · ") : "رواية"}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
