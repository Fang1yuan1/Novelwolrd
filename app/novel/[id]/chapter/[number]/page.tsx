import { getNovelById, getChapterByNumber } from "@/lib/novels";
import { notFound } from "next/navigation";
import ChapterTopBar from "@/components/chapter/ChapterTopBar";
import ChapterEngagementBar from "@/components/chapter/ChapterEngagementBar";
import AuthorNoteBox from "@/components/chapter/AuthorNoteBox";
import SupportBox from "@/components/chapter/SupportBox";
import ChapterReaderClient from "@/components/chapter/ChapterReaderClient";
import ChapterLeftRail from "@/components/chapter/ChapterLeftRail";

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
  const prevNumber = currentNumber - 1;
  const nextNumber = currentNumber + 1;
  const wordCount = chapter.content ? chapter.content.length : 0;

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex max-w-shell flex-col gap-2 px-3 py-4">
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          <a href={`/novel/${novel.id}`} className="hover:text-brand">
            ← {novel.title}
          </a>
          <a href="/" className="hover:text-brand">
            الرئيسية
          </a>
        </div>

        <ChapterTopBar
          category={novel.category}
          publishedAt={chapter.created_at}
          wordCount={wordCount}
        />

        <ChapterEngagementBar />

        <ChapterReaderClient
          novelId={novel.id}
          chapterTitle={chapter.title}
          chapterNumber={chapter.chapter_number}
          content={chapter.content}
        />

        <AuthorNoteBox author={novel.author} />

        <SupportBox />

        <div className="flex items-center justify-between rounded bg-white p-3 border border-ink-300/15">
          {prevNumber >= 1 ? (
            <a
              href={`/novel/${novel.id}/chapter/${prevNumber}`}
              className="rounded bg-surface px-3 py-2 text-sm font-medium text-ink-700 hover:text-brand"
            >
              → الفصل السابق
            </a>
          ) : (
            <span className="px-3 py-2 text-sm text-ink-300">→ الفصل السابق</span>
          )}

          <a
            href={`/novel/${novel.id}`}
            className="rounded bg-surface px-3 py-2 text-sm font-medium text-ink-700 hover:text-brand"
          >
            الفهرس
          </a>

          <a
            href={`/novel/${novel.id}/chapter/${nextNumber}`}
            className="rounded bg-brand px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            الفصل التالي ←
          </a>
        </div>
      </main>

      <ChapterLeftRail />
    </div>
  );
}
