import RankingSection, { type RankingListData } from "./RankingSection";
import { getCategoriesWithCounts, getNovels, parseCategories } from "@/lib/novels";
import { rankingLists as placeholderRankingLists } from "@/lib/placeholder-data";

export default async function RankingGrid() {
  const categories = await getCategoriesWithCounts();
  const novels = await getNovels();

  let lists: RankingListData[] = [];

  if (categories.length > 0 && novels.length > 0) {
    lists = categories
      .map((c) => {
        const novelsInCategory = novels.filter((n) =>
          parseCategories(n.category).includes(c.category)
        );
        return {
          id: c.category,
          title: c.category,
          badge: `${c.count} عمل`,
          entries: novelsInCategory.slice(0, 10).map((n, idx) => ({
            rank: idx + 1,
            title: n.title,
            href: `/novel/${n.id}`,
          })),
        };
      })
      .filter((list) => list.entries.length > 0)
      .slice(0, 5);
  }

  if (lists.length === 0) {
    lists = placeholderRankingLists;
  }

  return (
    <section aria-label="قوائم الترتيب" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {lists.map((list) => (
        <RankingSection key={list.id} list={list} />
      ))}
    </section>
  );
}
