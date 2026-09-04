import { getNovels } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import MobileNovelGrid from "./MobileNovelGrid";
import NovelListItem from "./NovelListItem";

// أقصى عدد روايات تظهر بقائمة "المزيد" أسفل الصفحة — دايمًا لغاية 25 لو البيانات كافية
const MORE_LIMIT = 25;

export default async function MobileCompletedPage() {
  const all = await getNovels();
  const completed = all.filter((n) => n.status === "completed");

  const popular = [...completed].sort(
    (a, b) => (b.chapter_count ?? 0) - (a.chapter_count ?? 0)
  );
  const newest = [...completed].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const more = popular.slice(0, MORE_LIMIT);

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="مكتمل" />
      <div className="mobile-reference-content">
        {completed.length === 0 ? (
          <p className="mobile-category-empty">لا توجد أعمال مكتملة حاليًا.</p>
        ) : (
          <>
            <MobileNovelGrid title="الأكثر شعبية" novels={popular} count={8} />
            <MobileNovelGrid title="الأحدث اكتمالًا" novels={newest} count={4} />

            <section className="mobile-reference-card px-3 py-3">
              <div className="mobile-reference-section-heading">
                <h2>المزيد</h2>
              </div>
              <ul className="flex flex-col gap-4">
                {more.map((novel) => (
                  <li key={novel.id}>
                    <NovelListItem novel={novel} wordCount={novel.word_count} />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
