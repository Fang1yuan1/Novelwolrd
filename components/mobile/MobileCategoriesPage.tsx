import { getCategories } from "@/lib/categories";
import { getCategoriesWithCounts, getNovelsByCategory, getNovelById } from "@/lib/novels";
import MobileCategoriesHeader from "./MobileCategoriesHeader";

export default async function MobileCategoriesPage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoriesWithCounts(),
  ]);
  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  const covers = await Promise.all(
    categories.map(async (c) => {
      if (c.cover_novel_id) {
        const n = await getNovelById(c.cover_novel_id);
        if (n?.cover_url) return n.cover_url;
      }
      const novels = await getNovelsByCategory(c.name);
      return novels.find((n) => n.cover_url)?.cover_url || null;
    })
  );

  return (
    <div className="mobile-reference-page">
      <MobileCategoriesHeader
        rightSlot={
          <>
            <a href="/" aria-label="بحث" className="mobile-gender-icon-btn">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/header/search.png" alt="" className="h-[19px] w-[19px] object-contain" aria-hidden="true" />
            </a>
            <span aria-hidden className="mobile-gender-icon-btn mobile-grid-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </span>
          </>
        }
      />

      <div className="mobile-reference-content">
        {categories.length === 0 ? (
          <p className="mobile-category-empty">لا توجد تصنيفات مضافة بعد.</p>
        ) : (
          <ul className="mobile-category-grid">
            {categories.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`/category/${encodeURIComponent(c.name)}`}
                  className="mobile-category-card"
                >
                  <span className="mobile-category-info">
                    <strong>{c.name}</strong>
                    <span>{countMap.get(c.name) || 0} عمل</span>
                  </span>
                  <span className="mobile-category-cover-stack">
                    <span className="mobile-category-cover-behind mobile-category-cover-behind-2" />
                    <span className="mobile-category-cover-behind mobile-category-cover-behind-1" />
                    <span className="mobile-category-cover-front">
                      {covers[i] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={covers[i]!} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
