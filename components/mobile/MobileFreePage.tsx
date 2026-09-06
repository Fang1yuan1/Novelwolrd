import { getNovels } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import MobileLimitedFree from "./MobileLimitedFree";
import MobileNextFree from "./MobileNextFree";
import NovelListItem from "./NovelListItem";

export default async function MobileFreePage() {
  const all = await getNovels();

  const currentBatch = all.slice(0, 6);
  const nextBatch = all.slice(6, 12);

  const popular = [...all]
    .sort((a, b) => (b.chapter_count ?? 0) - (a.chapter_count ?? 0))
    .slice(0, 3);

  const newest = [...all]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="مجاني" />
      <div className="mobile-reference-content">
        <section className="mobile-reference-card px-3 py-3">
          <h2 className="text-[19px] font-bold text-ink-900">
            أحدث الروايات المجانية
          </h2>
        </section>

        <MobileLimitedFree novels={currentBatch} />
        <MobileNextFree novels={nextBatch} />

        {popular.length > 0 && (
          <section className="mobile-reference-card px-3 py-3">
            <div className="mobile-reference-section-heading">
              <span className="mobile-reference-heading-group">
                <h2>الأكثر شعبية</h2>
                <span className="mobile-reference-badge-pill">الأعمال الأعلى قراءة</span>
              </span>
              <a href="/categories">المزيد ‹</a>
            </div>
            <ul className="flex flex-col gap-4">
              {popular.map((novel) => (
                <li key={novel.id}>
                  <NovelListItem novel={novel} wordCount={novel.word_count} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {newest.length > 0 && (
          <section className="mobile-reference-card px-3 py-3">
            <div className="mobile-reference-section-heading">
              <span className="mobile-reference-heading-group">
                <h2>جديد مجاني</h2>
                <span className="mobile-reference-badge-pill">أحدث الإضافات</span>
              </span>
              <a href="/categories">المزيد ‹</a>
            </div>
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
