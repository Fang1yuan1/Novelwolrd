import { getNovels } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

export default async function MobileCuratedBestsellers() {
  const all = await getNovels();
  // دفعة مختلفة عن قسم "الأكثر مبيعاً" (الذي يعرض المكتملة فقط) — هنا مزيج عام
  const picks = all.slice(3, 6);

  if (picks.length === 0) return null;

  

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <h2>مبيعات مختارة</h2>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="flex flex-col gap-4">
        {picks.map((novel) => (
          <li key={novel.id}>
            <NovelListItem novel={novel} wordCount={novel.word_count} />
          </li>
        ))}
      </ul>
    </section>
  );
}
