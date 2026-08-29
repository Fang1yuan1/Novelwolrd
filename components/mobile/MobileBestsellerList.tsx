import { getNovels, getChaptersByNovel, getWordCount } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

export default async function MobileBestsellerList() {
  const all = await getNovels();
  const completed = all.filter((n) => n.status === "completed").slice(0, 3);

  if (completed.length === 0) return null;

  const withCounts = await Promise.all(
    completed.map(async (n) => {
      const chapters = await getChaptersByNovel(n.id);
      return { novel: n, wordCount: getWordCount(chapters) };
    })
  );

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <h2>الأكثر مبيعاً</h2>
        <a href="/categories">المزيد ‹</a>
      </div>
      <ul className="flex flex-col gap-4">
        {withCounts.map(({ novel, wordCount }) => (
          <li key={novel.id}>
            <NovelListItem novel={novel} wordCount={wordCount} />
          </li>
        ))}
      </ul>
    </section>
  );
}
