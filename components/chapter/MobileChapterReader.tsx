"use client";

import { useState } from "react";
import { READER_PALETTES } from "@/lib/reader-theme";

const FONT_SIZE = 18;

type NovelData = { id: number; title: string };
type ChapterData = {
  chapter_number: number;
  title: string | null;
  content: string;
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="14" width="5" height="7" rx="2" />
      <rect x="16.5" y="14" width="5" height="7" rx="2" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export default function MobileChapterReader({
  novel,
  chapter,
  prevNumber,
  nextNumber,
}: {
  novel: NovelData;
  chapter: ChapterData;
  prevNumber: number;
  nextNumber: number;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const p = READER_PALETTES.light;
  const paragraphs = chapter.content
    .split(/\n+/)
    .map((text) => text.trim())
    .filter(Boolean);
  const chapterLabel = `الفصل ${chapter.chapter_number}${chapter.title ? ` ${chapter.title}` : ""}`;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: p.pageBg, color: p.text }}>
      <header
        className="sticky top-0 z-20 flex items-center gap-3 border-b px-3 py-2.5"
        style={{ backgroundColor: p.pageBg, borderColor: p.divider }}
      >
        <a href={`/novel/${novel.id}`} aria-label="رجوع" className="shrink-0">
          <IconBack />
        </a>
        <span className="line-clamp-1 min-w-0 flex-1 text-[13px] font-bold">
          {chapterLabel}
        </span>
        <span className="shrink-0 opacity-40" title="استماع صوتي — قريبًا" aria-hidden="true">
          <IconHeadphones />
        </span>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open Themes & Settings"
          aria-expanded={settingsOpen}
          className="shrink-0 rounded-full p-1"
        >
          <IconDots />
        </button>
      </header>

      <div className="flex items-stretch gap-3 px-4 pt-6">
        <span
          className="w-[3px] shrink-0 self-stretch rounded-full"
          style={{ backgroundColor: p.chipActiveText }}
        />
        <div>
          <div className="text-[15px] font-bold" style={{ color: p.text }}>
            الفصل {chapter.chapter_number}
          </div>
          {chapter.title && (
            <h1 className="mt-1 font-bold leading-snug" style={{ fontSize: FONT_SIZE + 9 }}>
              {chapter.title}
            </h1>
          )}
        </div>
      </div>

      <div className="px-4 pb-16 pt-6 text-justify" style={{ fontSize: FONT_SIZE }}>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 indent-8 leading-loose">
            {paragraph}
          </p>
        ))}
      </div>

      <div
        className="flex items-center justify-between gap-2 border-t px-4 py-4"
        style={{ borderColor: p.divider }}
      >
        <a
          href={prevNumber >= 1 ? `/novel/${novel.id}/chapter/${prevNumber}` : undefined}
          aria-disabled={prevNumber < 1}
          className="rounded-full px-4 py-2 text-[13px] font-bold"
          style={{
            backgroundColor: p.chipBg,
            color: prevNumber < 1 ? p.mutedText : p.chipText,
            opacity: prevNumber < 1 ? 0.5 : 1,
            pointerEvents: prevNumber < 1 ? "none" : "auto",
          }}
        >
          السابق
        </a>
        <a
          href={`/novel/${novel.id}/chapter/${nextNumber}`}
          className="rounded-full px-4 py-2 text-[13px] font-bold"
          style={{ backgroundColor: p.chipActiveBg, color: p.chipActiveText }}
        >
          التالي
        </a>
      </div>

      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3"
          role="presentation"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Themes & Settings"
            className="w-full overflow-hidden bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* الصورة الأصلية التي وفّرها المستخدم؛ لا يوجد أي نص أو إعادة تصميم فوقها. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/reader-settings-reference.png"
              alt="Themes & Settings"
              className="block h-auto w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
