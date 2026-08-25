import {
  getNovels,
  getChaptersByNovel,
  getWordCount,
  getCategoriesWithCounts,
  parseCategories,
  type Novel,
} from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import MobileRankSections, { type RankSection } from "./MobileRankSections";

type RankedNovel = Novel & { wordCount: number; chapterCount: number };

export default async function MobileRankingsPage() {
  const novels = await getNovels();
  const withCounts: RankedNovel[] = await Promise.all(
    novels.map(async (n) => {
      const chapters = await getChaptersByNovel(n.id);
      return { ...n, wordCount: getWordCount(chapters), chapterCount: chapters.length };
    })
  );

  const sections: RankSection[] = [];

  if (withCounts.length > 0) {
    sections.push({
      key: "words",
      label: "الأكثر كلمات",
      moreHref: "/categories",
      novels: [...withCounts].sort((a, b) => b.wordCount - a.wordCount).slice(0, 5),
    });
    sections.push({
      key: "chapters",
      label: "الأكثر فصولًا",
      moreHref: "/categories",
      novels: [...withCounts].sort((a, b) => b.chapterCount - a.chapterCount).slice(0, 5),
    });
    sections.push({
      key: "newest",
      label: "الأحدث إضافة",
      moreHref: "/categories",
      novels: [...withCounts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    });
    const completedTop = [...withCounts]
      .filter((n) => n.status === "completed")
      .sort((a, b) => b.chapterCount - a.chapterCount)
      .slice(0, 5);
    if (completedTop.length > 0) {
      sections.push({
        key: "completed",
        label: "الأعمال المكتملة",
        moreHref: "/completed",
        novels: completedTop,
      });
    }
  }

  // أقسام إضافية حسب أكبر التصنيفات فعليًا بالموقع (بيانات حقيقية من قاعدة البيانات)
  const categoryCounts = await getCategoriesWithCounts();
  const topCategories = categoryCounts
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  for (const { category } of topCategories) {
    const inCategory = withCounts
      .filter((n) => parseCategories(n.category).includes(category))
      .sort((a, b) => b.chapterCount - a.chapterCount)
      .slice(0, 5);
    if (inCategory.length > 0) {
      sections.push({
        key: `cat-${category}`,
        label: `الأعلى في ${category}`,
        moreHref: `/category/${encodeURIComponent(category)}`,
        novels: inCategory,
      });
    }
  }

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="الترتيب" />
      <div className="mobile-reference-content">
        <MobileRankSections sections={sections} />
      </div>
    </div>
  );
}
