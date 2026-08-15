"use client";

import { useState } from "react";
import type { Chapter, Novel } from "@/lib/novels";
import { groupChaptersByVolume } from "@/lib/novels";

export default function ChapterListCard({
  novel,
  chapters,
}: {
  novel: Novel;
  chapters: Chapter[];
}) {
  const [reversed, setReversed] = useState(false);

  const ordered = reversed ? [...chapters].reverse() : chapters;
  const volumes = groupChaptersByVolume(ordered);
  const lastChapter = chapters[chapters.length - 1];

  return (
    <div id="toc" className="scroll-mt-3 rounded bg-white p-3 border border-ink-300/15">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-ink-300/20 pb-2">
        <h2 className="text-sm font-bold text-ink-900">
          الفهرس{" "}
          <span className="text-[11px] font-normal text-ink-300">
            ({chapters.length} فصل)
          </span>
        </h2>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setReversed((r) => !r)}
            className="rounded border border-ink-300/40 px-2 py-1 text-ink-700 hover:border-brand hover:text-brand"
          >
            ⇅ {reversed ? "الأقدم أولًا" : "الأحدث أولًا"}
          </button>
        </div>
      </div>

      {lastChapter && (
        <p className="mb-2 rounded bg-surface px-2 py-1.5 text-[12px] text-ink-500">
          آخر تحديث: الفصل {lastChapter.chapter_number}
          {lastChapter.title ? ` — ${lastChapter.title}` : ""}
        </p>
      )}

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
  );
}
