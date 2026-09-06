import { getNovels } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

export default async function MobileFreshList() {
  const all = await getNovels();
  const fresh = all.filter((n) => n.status !== "completed").slice(0, 3);

  if (fresh.length === 0) return null;

  

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>جديد سريع الانتشار</h2>
          <span className="mobile-reference-badge-pill">جديد آخر 24 ساعة</span>
        </span>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="flex flex-col gap-4">
        {fresh.map((novel) => (
          <li key={novel.id}>
            <NovelListItem novel={novel} wordCount={novel.word_count} />
          </li>
        ))}
      </ul>
    </section>
  );
}
