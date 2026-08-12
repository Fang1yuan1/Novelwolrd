import { getNovelById, getChapterByNumber } from "@/lib/novels";
import { notFound } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex max-w-shell flex-col gap-3 px-3 py-4">
        <div className="flex items-center justify-between text-[11px] text-ink-500">
          <a href={`/novel/${novel.id}`} className="hover:text-brand">
            ← {novel.title}
          </a>
          <a href="/" className="hover:text-brand">
            الرئيسية
          </a>
        </div>

        <div className="rounded bg-white p-4 border border-ink-300/15">
          <h1 className="mb-1 text-lg font-bold text-ink-900">
            الفصل {chapter.chapter_number}
            {chapter.title ? ` — ${chapter.title}` : ""}
          </h1>
          {chapter.volume && (
            <p className="mb-4 text-[11px] text-ink-300">{chapter.volume}</p>
          )}

          <div className="whitespace-pre-wrap text-[15px] leading-loose text-ink-900">
            {chapter.content}
          </div>
        </div>

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
    </div>
  );
}
