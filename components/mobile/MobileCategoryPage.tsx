import { getNovelsByCategory } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import MobileNovelGrid from "./MobileNovelGrid";

export default async function MobileCategoryPage({
  categoryName,
}: {
  categoryName: string;
}) {
  const novels = await getNovelsByCategory(categoryName);

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title={categoryName} />
      <div className="mobile-reference-content">
        {novels.length === 0 ? (
          <p className="mobile-category-empty">
            لا توجد روايات في هذا التصنيف حاليًا.
          </p>
        ) : (
          <MobileNovelGrid
            title="كل الأعمال"
            novels={novels}
            count={novels.length}
            moreHref="/categories"
          />
        )}
      </div>
    </div>
  );
}
