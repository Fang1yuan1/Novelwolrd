import { getNovels } from "@/lib/novels";
import MobileRankTabs from "./MobileRankTabs";

export default async function MobileRankGrid() {
  const all = await getNovels();
  const withCounts = all.map((n) => ({
    ...n,
    wordCount: n.word_count ?? 0,
    chapterCount: n.chapter_count ?? 0,
  }));

  if (withCounts.length === 0) return null;

  return <MobileRankTabs novels={withCounts} />;
}
