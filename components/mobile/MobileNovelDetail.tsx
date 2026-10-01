import type { ChapterSummary, Novel } from "@/lib/novels";
import { displayTitle, getDisplayLanguage } from "@/lib/display-language";
import MobileBackHeader from "./MobileBackHeader";
import MobileNovelHero from "./MobileNovelHero";
import MobileDescriptionCard from "./MobileDescriptionCard";
import MobileChapterPreview from "./MobileChapterPreview";
import MobileCharactersSection from "./MobileCharactersSection";
import MobileChapterTrialRead from "./MobileChapterTrialRead";

export default async function MobileNovelDetail({
  novel,
  chapters,
  chapterTotal,
}: {
  novel: Novel;
  chapters: ChapterSummary[];
  chapterTotal?: number;
  related: Novel[];
}) {
  const lang = await getDisplayLanguage();
  const title = displayTitle(novel, lang);
  return (
    <div className="min-h-screen bg-surface pb-6">
      <MobileBackHeader title={title} />
      <MobileNovelHero novel={novel} chapters={chapters} chapterTotal={chapterTotal} displayTitle={title} />
      <MobileDescriptionCard novel={novel} />
      <MobileChapterPreview novel={novel} chapters={chapters} />
      <MobileCharactersSection novelId={novel.id} />
      <MobileChapterTrialRead novel={novel} />
    </div>
  );
}
