import { getNovels, getChaptersByNovel, getWordCount } from "@/lib/novels";
import MobileRankTabs from "./MobileRankTabs";

export default async function MobileRankGrid() {
  const all = await getNovels();
  const withCounts = await Promise.all(
    all.map(async (n) => {
      const chapters = await getChaptersByNovel(n.id);
      return { ...n, wordCount: getWordCount(chapters), chapterCount: chapters.length };
    })
  );

  if (withCounts.length === 0) return null;

  return <MobileRankTabs novels={withCounts} />;
}
