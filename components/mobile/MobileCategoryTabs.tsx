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
    .slice(0, 5);

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
      <div className="mobile-reference-book-grid mt-3">
        {filtered.map((n) => {
          const cats = parseCategories(n.category);
          return (
            <a key={n.id} href={`/novel/${n.id}`} className="mobile-reference-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.cover_url} alt={n.title} />
              ) : (
                <span className="mobile-reference-cover-placeholder" />
              )}
              <strong>{n.title}</strong>
              <span>{cats.length > 0 ? cats.slice(0, 2).join(" · ") : "رواية"}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
