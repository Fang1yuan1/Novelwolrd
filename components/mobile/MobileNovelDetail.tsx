import type { ChapterSummary, Novel } from "@/lib/novels";
import MobileBackHeader from "./MobileBackHeader";
import MobileNovelHero from "./MobileNovelHero";
import MobileDescriptionCard from "./MobileDescriptionCard";
import MobileChapterPreview from "./MobileChapterPreview";
import MobileCharactersSection from "./MobileCharactersSection";
import MobileChapterTrialRead from "./MobileChapterTrialRead";

export default function MobileNovelDetail({
  novel,
  chapters,
  chapterTotal,
}: {
  novel: Novel;
  chapters: ChapterSummary[];
  chapterTotal?: number;
  related: Novel[];
}) {
  return (
    <div className="min-h-screen bg-surface pb-6">
      <MobileBackHeader title={novel.title} />
      <MobileNovelHero novel={novel} chapters={chapters} chapterTotal={chapterTotal} />
      <MobileDescriptionCard novel={novel} />
      <MobileChapterPreview novel={novel} chapters={chapters} />
      <MobileCharactersSection novelId={novel.id} />
      <MobileChapterTrialRead novel={novel} />
    </div>
  );
}
