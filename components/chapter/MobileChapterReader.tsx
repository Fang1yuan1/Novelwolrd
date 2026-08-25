"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

const STORAGE_KEY = "novelwolrd-reader-prefs";
const FONT_SIZES = [16, 18, 20, 22, 24];

type NovelData = { id: number; title: string };
type ChapterData = {
  chapter_number: number;
  title: string | null;
  content: string;
};

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
function IconHeadphones() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="14" width="5" height="7" rx="2" />
      <rect x="16.5" y="14" width="5" height="7" rx="2" />
    </svg>
  );
}
function IconDots() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [fontIdx, setFontIdx] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.theme) setTheme(saved.theme);
        if (typeof saved.fontSizeIdx === "number") setFontIdx(saved.fontSizeIdx);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, theme, fontSizeIdx: fontIdx })
      );
    } catch {}
  }, [theme, fontIdx, mounted]);

  const p = READER_PALETTES[theme];
  const fontSize = FONT_SIZES[fontIdx];
  const paragraphs = chapter.content
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const chapterLabel = `الفصل ${chapter.chapter_number}${chapter.title ? ` ${chapter.title}` : ""}`;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: p.pageBg, color: p.text }}
    >
      {/* شريط علوي — رقم واسم الفصل (كالمرجع)، وليس اسم الرواية */}
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
          onClick={() => setBarsVisible((v) => !v)}
          aria-label="الإعدادات"
          className="shrink-0"
        >
          <IconDots />
        </button>
      </header>

      {/* عنوان الفصل داخل النص */}
      <div className="px-4 pt-6" onClick={() => setBarsVisible((v) => !v)}>
        <div className="flex items-center gap-2.5">
          <span
            className="h-4 w-[3px] shrink-0 rounded-full"
            style={{ backgroundColor: p.chipActiveText }}
          />
          <span className="text-[14px] font-bold" style={{ color: p.mutedText }}>
            الفصل {chapter.chapter_number}
          </span>
        </div>
        {chapter.title && (
          <div className="mt-2 flex items-start gap-2.5">
            <span
              className="mt-1 h-6 w-[3px] shrink-0 rounded-full"
              style={{ backgroundColor: p.chipActiveText }}
            />
            <h1 className="font-bold leading-snug" style={{ fontSize: fontSize + 8 }}>
              {chapter.title}
            </h1>
          </div>
        )}
      </div>

      {/* النص — الضغط عليه يُظهر/يخفي شريط الإعدادات السفلي */}
      <div
        className="px-4 pb-24 pt-6 text-justify"
        style={{ fontSize }}
        onClick={() => setBarsVisible((v) => !v)}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className="mb-4 indent-8 leading-loose">
            {para}
          </p>
        ))}
      </div>

      {/* شريط سفلي — مخفي افتراضيًا، يظهر فقط عند الضغط على النص */}
      {barsVisible && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 border-t px-3 py-2.5"
          style={{ backgroundColor: p.pageBg, borderColor: p.divider }}
        >
          <a
            href={prevNumber >= 1 ? `/novel/${novel.id}/chapter/${prevNumber}` : undefined}
            aria-disabled={prevNumber < 1}
            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold"
            style={{
              backgroundColor: p.chipBg,
              color: prevNumber < 1 ? p.mutedText : p.chipText,
              opacity: prevNumber < 1 ? 0.5 : 1,
              pointerEvents: prevNumber < 1 ? "none" : "auto",
            }}
          >
            السابق
          </a>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFontIdx((i) => Math.max(0, i - 1));
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: p.chipBg, color: p.chipText }}
              aria-label="تصغير الخط"
            >
              <IconMinus />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1));
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: p.chipBg, color: p.chipText }}
              aria-label="تكبير الخط"
            >
              <IconPlus />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTheme(theme === "night" ? "light" : "night");
              }}
              className="rounded-full px-2.5 py-1.5 text-[12px] font-bold"
              style={{ backgroundColor: p.chipBg, color: p.chipText }}
            >
              {theme === "night" ? "☀︎" : "☾"}
            </button>
          </div>

          <a
            href={`/novel/${novel.id}/chapter/${nextNumber}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold"
            style={{ backgroundColor: p.chipActiveBg, color: p.chipActiveText }}
          >
            التالي
          </a>
        </div>
      )}
    </div>
  );
}
