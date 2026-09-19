"use client";

import { useEffect, useRef, useState } from "react";
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
  const chipsRef = useRef<HTMLUListElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // الصفوف الأفقية تبدأ دائماً من أولها (يمين): 4 أغلفة كاملة + جزء من الخامس كالمرجع
  useEffect(() => {
    if (chipsRef.current) chipsRef.current.scrollLeft = 0;
  }, [categories.length]);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollLeft = 0;
  }, [active]);

  const filtered = novels
    .filter((n) => parseCategories(n.category).includes(active))
    .slice(0, 10);

  if (categories.length === 0) return null;

  return (
    <section className="mobile-reference-card nw-section">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>توصيات حسب التصنيف</h2>
          <span className="mobile-reference-badge-pill">اختيار المحرر</span>
        </span>
        <a href="/categories" className="mobile-reference-more-link">المزيد ‹</a>
      </div>
      <ul className="nw-free-scroll nw-chips" ref={chipsRef}>
        {categories.map((c) => (
          <li key={c} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(c)}
              className={`nw-chip${active === c ? " is-active" : ""}`}
            >
              {c}
            </button>
          </li>
        ))}
      </ul>
      <ul className="nw-free-scroll nw-cat-list" ref={listRef}>
        {filtered.map((n) => (
          <li key={n.id} className="nw-free-item">
            <a href={`/novel/${n.id}`} className="nw-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="nw-book-cover" src={n.cover_url} alt={n.title} />
              ) : (
                <span className="nw-book-cover" />
              )}
              <strong className="nw-book-title">{n.title}</strong>
              <span className="nw-book-author">{n.author || "—"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
