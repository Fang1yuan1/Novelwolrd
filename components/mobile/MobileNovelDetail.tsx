import type { Chapter, Novel } from "@/lib/novels";
import MobileBackHeader from "./MobileBackHeader";
import MobileNovelHero from "./MobileNovelHero";
import MobileDescriptionCard from "./MobileDescriptionCard";
import MobileChapterPreview from "./MobileChapterPreview";
import MobileCharactersSection from "./MobileCharactersSection";
import MobileRelatedNovels from "./MobileRelatedNovels";

export default function MobileNovelDetail({
  novel,
  chapters,
  related,
}: {
  novel: Novel;
  chapters: Chapter[];
  related: Novel[];
}) {
  return (
    <div className="min-h-screen bg-surface pb-6">
      <MobileBackHeader title={novel.title} />
      <MobileNovelHero novel={novel} chapters={chapters} />
      <MobileDescriptionCard novel={novel} />
      <MobileChapterPreview novel={novel} chapters={chapters} />
      <MobileCharactersSection novelId={novel.id} />
      <MobileRelatedNovels novels={related} category={novel.category} />
    </div>
  );
}
