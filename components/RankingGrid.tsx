import RankingSection from "./RankingSection";
import { rankingLists } from "@/lib/placeholder-data";

export default function RankingGrid() {
  return (
    <section aria-label="قوائم الترتيب" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {rankingLists.map((list) => (
        <RankingSection key={list.id} list={list} />
      ))}
    </section>
  );
}
