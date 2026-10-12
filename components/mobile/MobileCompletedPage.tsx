import { getNovels } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import NovelListItem from "./NovelListItem";
import MobileCoverRow from "./MobileCoverRow";


// الصفحة دي معمولة بالكامل من عناصر موجودة أصلاً بالصفحة الرئيسية
// (نفس كارت "الأكثر مبيعاً" ونفس صف الغلاف الأفقي اللي بيستخدمه
// "روايات قصيرة") — من غير أي تصميم جديد، بس بترتيب واقسام
// بتطابق هيكل صفحة "完本" بالمرجع الصيني:
// 1) صف أفقي علوي (زي "影视同期")
// 2) 3 كروت قوائم متتالية بعنوان + "المزيد" (زي "经典必读" / "大神完本" / "畅销完本")
// 3) قائمة "المزيد" الكاملة في الآخر
export default async function MobileCompletedPage() {
  const all = await getNovels();
  const completed = all.filter((n) => n.status === "completed");

  const popular = [...completed].sort(
    (a, b) => (b.chapter_count ?? 0) - (a.chapter_count ?? 0)
  );
  const newest = [...completed].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const longest = [...completed].sort(
    (a, b) => (b.word_count ?? 0) - (a.word_count ?? 0)
  );

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="مكتمل" />
      <div className="mobile-reference-content">
        {completed.length === 0 ? (
          <p className="mobile-category-empty">لا توجد أعمال مكتملة حاليًا.</p>
        ) : (
          <>
            {/* 1) صف أفقي علوي — بنفس هندسة «مجاني لفترة محدودة» */}
            <MobileCoverRow title="الأكثر شعبية" badge="أعمال مكتملة مميزة" novels={popular.slice(0, 8)} />

            {/* 2) الأحدث اكتمالًا — نفس ستايل "الأكثر مبيعاً" بالرئيسية */}
            {newest.length > 0 && (
              <section className="mobile-reference-card px-3 py-3">
                <div className="mobile-reference-section-heading">
                  <h2>الأحدث اكتمالًا</h2>
                  <a href="/categories" className="mobile-reference-more-link">المزيد ‹</a>
                </div>
                <ul className="flex flex-col gap-4">
                  {newest.slice(0, 3).map((n) => (
                    <li key={n.id}>
                      <NovelListItem novel={n} wordCount={n.word_count} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3) الأطول والأغزر — نفس الستايل، ترتيب مختلف */}
            {longest.length > 0 && (
              <section className="mobile-reference-card px-3 py-3">
                <div className="mobile-reference-section-heading">
                  <h2>الأطول والأغزر</h2>
                  <a href="/categories" className="mobile-reference-more-link">المزيد ‹</a>
                </div>
                <ul className="flex flex-col gap-4">
                  {longest.slice(0, 3).map((n) => (
                    <li key={n.id}>
                      <NovelListItem novel={n} wordCount={n.word_count} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 4) الأكثر مبيعًا (من المكتمل) */}
            {popular.length > 3 && (
              <section className="mobile-reference-card px-3 py-3">
                <div className="mobile-reference-section-heading">
                  <h2>روايات مميزة</h2>
                  <a href="/categories" className="mobile-reference-more-link">المزيد ‹</a>
                </div>
                <ul className="flex flex-col gap-4">
                  {popular.slice(3, 6).map((n) => (
                    <li key={n.id}>
                      <NovelListItem novel={n} wordCount={n.word_count} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
