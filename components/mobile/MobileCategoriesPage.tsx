import { getCategories } from "@/lib/categories";
import { getCategoriesWithCounts } from "@/lib/novels";
import CategoryIcon from "@/components/CategoryIcon";
import MobileGenderHeader from "./MobileGenderHeader";

export default async function MobileCategoriesPage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoriesWithCounts(),
  ]);
  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader
        title="التصنيفات"
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
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`/category/${encodeURIComponent(c.name)}`}
                  className="mobile-category-card"
                >
                  <span className="mobile-category-cover">
                    <CategoryIcon
                      icon={c.icon}
                      className="text-4xl"
                      imgClassName="h-full w-full object-cover"
                    />
                  </span>
                  <span className="mobile-category-info">
                    <strong>{c.name}</strong>
                    <span>{countMap.get(c.name) || 0} عمل</span>
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
