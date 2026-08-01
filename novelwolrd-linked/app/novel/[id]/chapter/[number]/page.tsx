import { getNovelById, getChapterByNumber } from "@/lib/novels";
import { notFound } from "next/navigation";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; number: string }>;
}) {
  const { id, number } = await params;
  const [novel, chapter] = await Promise.all([
    getNovelById(id),
    getChapterByNumber(id, number),
  ]);

  if (!novel || !chapter) {
    notFound();
  }

  const chapterNum = Number(number);
  const prevHref = chapterNum > 1 ? `/novel/${id}/chapter/${chapterNum - 1}` : null;
  const nextHref = `/novel/${id}/chapter/${chapterNum + 1}`;

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex max-w-2xl flex-col gap-3 px-3 py-4">
        <a href={`/novel/${novel.id}`} className="text-[11px] text-ink-500 hover:text-brand">
          ← {novel.title}
        </a>

        <div className="rounded bg-white p-4 border border-ink-300/15">
          <h1 className="mb-4 text-lg font-bold text-ink-900">
            الفصل {chapter.chapter_number}
            {chapter.title ? ` — ${chapter.title}` : ""}
          </h1>
          <div className="whitespace-pre-wrap text-[15px] leading-loose text-ink-900">
            {chapter.content}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded bg-white p-2 border border-ink-300/15">
          {prevHref ? (
            <a
              href={prevHref}
              className="rounded border border-ink-300/40 px-3 py-1.5 text-sm text-ink-700 hover:border-brand hover:text-brand"
            >
              ‹ السابق
            </a>
          ) : (
            <span />
          )}
          <a
            href={`/novel/${novel.id}`}
            className="text-sm text-ink-500 hover:text-brand"
          >
            فهرس الفصول
          </a>
          <a
            href={nextHref}
            className="rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-dark"
          >
            التالي ›
          </a>
        </div>
      </main>
    </div>
  );
}
