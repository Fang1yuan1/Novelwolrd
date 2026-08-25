"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";
import MobileReaderSettingsSheet from "./MobileReaderSettingsSheet";

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
  const [theme, setTheme] = useState<ReaderTheme>("original");
  const [fontIdx, setFontIdx] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [showSheet, setShowSheet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.theme && saved.theme in READER_PALETTES) setTheme(saved.theme);
        if (typeof saved.fontIdx === "number") setFontIdx(saved.fontIdx);
        if (typeof saved.brightness === "number") setBrightness(saved.brightness);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, fontIdx, brightness })
      );
    } catch {}
  }, [theme, fontIdx, brightness, mounted]);

  const p = READER_PALETTES[theme];
  const fontSize = FONT_SIZES[fontIdx];
  const paragraphs = chapter.content
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const chapterLabel = `الفصل ${chapter.chapter_number}${chapter.title ? ` ${chapter.title}` : ""}`;

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: p.pageBg, color: p.text }}
    >
      {/* شريط علوي — رقم واسم الفصل */}
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
          onClick={() => setShowSheet(true)}
          aria-label="الثيمات والإعدادات"
          className="shrink-0"
        >
          <IconDots />
        </button>
      </header>

      {/* عنوان الفصل — خط عمودي واحد متصل يمتد على السطرين معًا (كالمرجع بدقة) */}
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
            <h1
              className="mt-1 font-bold leading-snug"
              style={{ fontSize: fontSize + 9 }}
            >
              {chapter.title}
            </h1>
          )}
        </div>
      </div>

      {/* النص */}
      <div
        className="px-4 pb-16 pt-6 text-justify"
        style={{ fontSize, fontWeight: p.boldText ? 700 : 400 }}
      >
        {paragraphs.map((para, i) => (
          <p key={i} className="mb-4 indent-8 leading-loose">
            {para}
          </p>
        ))}
      </div>

      {/* تنقل بسيط أسفل النص فقط (وليس شريطًا ثابتًا) */}
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

      {/* ستارة السطوع — تعتيم حقيقي فوق الشاشة حسب قيمة الشريط */}
      {mounted && brightness < 100 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 bg-black"
          style={{ opacity: (100 - brightness) / 100 * 0.75 }}
        />
      )}

      {showSheet && (
        <MobileReaderSettingsSheet
          theme={theme}
          setTheme={setTheme}
          fontIdx={fontIdx}
          setFontIdx={setFontIdx}
          fontSizes={FONT_SIZES}
          brightness={brightness}
          setBrightness={setBrightness}
          onClose={() => setShowSheet(false)}
          onCustomize={() => setShowSheet(false)}
        />
      )}
    </div>
  );
}
