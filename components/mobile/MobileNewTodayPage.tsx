import { getNovels } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import NovelListItem from "./NovelListItem";

// أقصى عدد روايات تظهر بالصفحة — دايمًا لغاية 17 لو البيانات كافية
const LIMIT = 17;

export default async function MobileNewTodayPage() {
  const all = await getNovels();
  const newest = [...all]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, LIMIT);

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="جديد اليوم" />
      <div className="mobile-reference-content">
        {newest.length === 0 ? (
          <p className="mobile-category-empty">لا توجد أعمال مضافة حاليًا.</p>
        ) : (
          <section className="mobile-reference-card mobile-reference-card--flush px-3 py-3">
            <ul className="flex flex-col gap-4">
              {newest.map((novel) => (
                <li key={novel.id}>
                  <NovelListItem novel={novel} wordCount={novel.word_count} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
