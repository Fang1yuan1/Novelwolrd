import { getNovelById, getChapterByNumber } from "@/lib/novels";
import { notFound } from "next/navigation";
import ChapterPageClient from "@/components/chapter/ChapterPageClient";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; number: string }>;
}) {
  const { id, number } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  const chapter = await getChapterByNumber(id, number);

  if (!chapter) {
    notFound();
  }

  const currentNumber = Number(number);

  return (
    <ChapterPageClient
      novel={novel}
      chapter={chapter}
      prevNumber={currentNumber - 1}
      nextNumber={currentNumber + 1}
    />
  );
}
