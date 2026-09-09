"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

const ALL = "الكل";

export default function MobileNewTodaySection({
  categories,
  novels,
  dateLabel,
  limit = 20,
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

  // نكمّل صفوف الشبكة بالكامل (4 لكل صف) بدل ما نسيب صف أخير ناقص —
  // نفس منطق شبكة "الأكثر قراءة" بالصفحة الرئيسية
  const available = Math.min(limit, filtered.length);
  const fullRows = Math.floor(available / 4);
  const showCount = fullRows > 0 ? fullRows * 4 : available;
  const visible = filtered.slice(0, showCount);

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

      {/* شبكة أغلفة على شكل أيقونات (فراغ حواليها) — نفس ستايل شبكة "الأكثر قراءة" بالرئيسية */}
      {visible.length === 0 ? (
        <p className="mobile-category-empty">لا توجد أعمال بهذا التصنيف حاليًا.</p>
      ) : (
        <section className="mobile-reference-card mobile-reference-card--flush mobile-reference-books">
          <div className="mobile-reference-book-grid">
            {visible.map((novel) => {
              const cats = parseCategories(novel.category);
              return (
                <a
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="mobile-reference-book"
                >
                  {novel.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={novel.cover_url} alt={novel.title} />
                  ) : (
                    <span className="mobile-reference-cover-placeholder" />
                  )}
                  <strong>{novel.title}</strong>
                  <span>
                    {cats.length > 0 ? cats.slice(0, 2).join(" · ") : "رواية"}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

