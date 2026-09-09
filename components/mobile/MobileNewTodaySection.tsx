"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

const ALL = "الكل";

export default function MobileNewTodaySection({
  categories,
  novels,
  dateLabel,
  limit = 27,
}: {
  categories: string[];
  novels: Novel[];
  dateLabel: string;
  limit?: number;
}) {
  const [active, setActive] = useState(ALL);

  const filtered =
    active === ALL
      ? novels
      : novels.filter((n) => parseCategories(n.category).includes(active));

  const visible = filtered.slice(0, limit);

  return (
    <>
      {/* شريط التصنيفات — نفس حجم ومكان تبويبات المرجع (全站/玄幻/...) */}
      <section className="mobile-reference-card mobile-reference-card--flush mobile-newtoday-tabs">
        <ul className="mobile-newtoday-tabs-grid">
          <li>
            <button
              type="button"
              onClick={() => setActive(ALL)}
              className={`mobile-newtoday-tab ${active === ALL ? "is-active" : ""}`}
            >
              {ALL}
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => setActive(c)}
                className={`mobile-newtoday-tab ${active === c ? "is-active" : ""}`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
        {/* التاريخ — نفس مكان "2026.09.06 ~ 2026.09.13" بالمرجع */}
        <p className="mobile-newtoday-date">{dateLabel}</p>
      </section>

      {/* نفس شكل قسم "الأكثر مبيعاً" بالضبط (NovelListItem) */}
      {visible.length === 0 ? (
        <p className="mobile-category-empty">لا توجد أعمال بهذا التصنيف حاليًا.</p>
      ) : (
        <section className="mobile-reference-card px-3 py-3">
          <ul className="flex flex-col gap-4">
            {visible.map((novel) => (
              <li key={novel.id}>
                <NovelListItem novel={novel} wordCount={novel.word_count} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}


