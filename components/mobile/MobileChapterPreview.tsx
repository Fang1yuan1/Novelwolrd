"use client";

import { useState } from "react";
import type { Chapter, Novel } from "@/lib/novels";
import { groupChaptersByVolume } from "@/lib/novels";

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function MobileChapterPreview({
  novel,
  chapters,
}: {
  novel: Novel;
  chapters: Chapter[];
}) {
  const [expanded, setExpanded] = useState(false);
  const previewCount = 3;
  const recentFirst = [...chapters].reverse();
  const preview = recentFirst.slice(0, previewCount);
  const volumes = groupChaptersByVolume(chapters);
  const firstChapter = chapters[0];

  return (
    <section className="border-t border-ink-300/10 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/10 pb-2">
        <h2 className="text-[16px] font-bold text-ink-900">
          الفهرس{" "}
          <span className="text-[11px] font-normal text-ink-300">
            ({chapters.length} فصل)
          </span>
        </h2>
        {chapters.length > previewCount && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-[15px] text-ink-300"
            aria-label={expanded ? "إخفاء الفصول" : "عرض كل الفصول"}
          >
            {expanded ? "‹" : "›"}
          </button>
        )}
      </div>

      {chapters.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-ink-300">
          لم تُرفع فصول لهذا العمل بعد.
        </p>
      ) : !expanded ? (
        <ul className="flex flex-col gap-3">
          {preview.map((ch, i) => (
            <li key={ch.id}>
              <a
                href={`/novel/${novel.id}/chapter/${ch.chapter_number}`}
                className="block"
              >
                <p
                  className={
                    i === 0
                      ? "line-clamp-1 text-[14px] font-bold text-ink-900"
                      : "line-clamp-1 text-[13px] text-ink-700"
                  }
                >
                  {i === 0 ? "أحدث فصل — " : ""}
                  {ch.chapter_number}
                  {ch.title ? `، ${ch.title}` : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-300">
                  {formatDate(ch.created_at)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-3">
          {volumes.map((v) => (
            <details key={v.volume} open className="group">
              <summary className="cursor-pointer list-none rounded bg-surface px-2 py-1.5 text-[13px] font-semibold text-ink-900">
                {v.volume}{" "}
                <span className="text-[10px] font-normal text-ink-300">
                  ({v.chapters.length})
                </span>
              </summary>
              <ul className="mt-1 divide-y divide-ink-300/10">
                {v.chapters.map((ch) => (
                  <li key={ch.id}>
                    <a
                      href={`/novel/${novel.id}/chapter/${ch.chapter_number}`}
                      className="line-clamp-1 block py-2 text-[13px] text-ink-700"
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

      {firstChapter && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            disabled
            title="التحميل غير متاح حاليًا"
            className="rounded-full border border-brand/30 px-4 py-2.5 text-[13px] font-medium text-brand/40"
          >
            تحميل
          </button>
          <a
            href={`/novel/${novel.id}/chapter/${firstChapter.chapter_number}`}
            className="flex-1 rounded-full bg-brand py-2.5 text-center text-sm font-bold text-white"
          >
            ابدأ القراءة
          </a>
        </div>
      )}
    </section>
  );
}
