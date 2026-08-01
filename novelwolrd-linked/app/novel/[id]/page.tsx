import { getNovelById, getChaptersByNovel, groupChaptersByVolume } from "@/lib/novels";
import { notFound } from "next/navigation";

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  const chapters = await getChaptersByNovel(id);
  const volumes = groupChaptersByVolume(chapters);

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto flex max-w-shell flex-col gap-3 px-3 py-4">
        <a href="/" className="text-[11px] text-ink-500 hover:text-brand">
          ← الرئيسية
        </a>

        <div className="flex flex-col gap-3 rounded bg-white p-3 border border-ink-300/15 sm:flex-row">
          <span className="ph-block aspect-[3/4] w-32 shrink-0 rounded text-[11px] sm:w-40">
            الغلاف
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="mb-1 text-xl font-bold text-ink-900">{novel.title}</h1>
            {novel.category && (
              <span className="mb-2 inline-block rounded bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                {novel.category}
              </span>
            )}
            <p className="mb-2 text-[11px] text-ink-300">{chapters.length} فصل</p>
            <p className="text-sm leading-relaxed text-ink-700">
              {novel.description || "لا يوجد وصف لهذا العمل بعد."}
            </p>
          </div>
        </div>

        <div className="rounded bg-white p-3 border border-ink-300/15">
          <h2 className="mb-2 border-b border-ink-300/20 pb-2 text-sm font-bold text-ink-900">
            الفصول
          </h2>

          {chapters.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-300">
              لم تُرفع فصول لهذا العمل بعد.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {volumes.map((v) => (
                <details key={v.volume} open className="group">
                  <summary className="cursor-pointer list-none rounded bg-surface px-2 py-1.5 text-sm font-semibold text-ink-900">
                    {v.volume}
                    <span className="ms-2 text-[11px] font-normal text-ink-300">
                      ({v.chapters.length} فصل)
                    </span>
                  </summary>
                  <ul className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {v.chapters.map((ch) => (
                      <li key={ch.id}>
                        <a
                          href={`/novel/${novel.id}/chapter/${ch.chapter_number}`}
                          className="line-clamp-1 block rounded px-2 py-1.5 text-[13px] text-ink-700 hover:bg-surface hover:text-brand"
                        >
                          الفصل {ch.chapter_number}
                          {ch.title ? ` — ${ch.title}` : ""}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
