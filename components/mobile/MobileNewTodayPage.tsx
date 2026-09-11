import { getNovels } from "@/lib/novels";
import { getCategories } from "@/lib/categories";
import MobileGenderHeader from "./MobileGenderHeader";
import MobileNewTodaySection from "./MobileNewTodaySection";

// أقصى عدد روايات تظهر بالصفحة لهذا التاريخ
const LIMIT = 27;

export default async function MobileNewTodayPage() {
  const [all, categoryRows] = await Promise.all([getNovels(), getCategories()]);
  const categories = categoryRows.map((c) => c.name);

  const newest = [...all].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const today = new Date();
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(
    today.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="جديد اليوم" />
      <div className="mobile-reference-content">
        {newest.length === 0 ? (
          <p className="mobile-category-empty">لا توجد أعمال مضافة حاليًا.</p>
        ) : (
          <MobileNewTodaySection
            categories={categories}
            novels={newest}
            dateLabel={dateLabel}
            limit={LIMIT}
          />
        )}
      </div>
    </div>
  );
}
