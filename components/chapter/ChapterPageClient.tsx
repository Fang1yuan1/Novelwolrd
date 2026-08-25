"use client";

import { useEffect, useState } from "react";
import {
  READER_PALETTES,
  READER_FONTS,
  READER_WIDTHS,
  type ReaderTheme,
  type ReaderFontId,
  type ReaderWidthId,
} from "@/lib/reader-theme";
import SettingsModal from "./SettingsModal";

const FONT_SIZES = [15, 17, 19, 21, 23];
const STORAGE_KEY = "novelwolrd-reader-prefs";

// أيقونات خطية بسيطة (بدون إيموجي) — تطابق أسلوب qidian المرجعي
function IconList() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 5.5c2-1 5-1 8 0v13c-3-1-6-1-8 0V5.5Z" />
      <path d="M20 5.5c-2-1-5-1-8 0v13c3-1 6-1 8 0V5.5Z" />
    </svg>
  );
}
function IconShelfPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="12" height="4.5" rx="1" />
      <rect x="3" y="14.5" width="12" height="4.5" rx="1" />
      <circle cx="18.5" cy="7" r="4" />
      <line x1="18.5" y1="5" x2="18.5" y2="9" />
      <line x1="16.5" y1="7" x2="20.5" y2="7" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="4.2" y1="4.2" x2="6" y2="6" />
      <line x1="18" y1="18" x2="19.8" y2="19.8" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.2" y1="19.8" x2="6" y2="18" />
      <line x1="18" y1="6" x2="19.8" y2="4.2" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}
function IconSliders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2.1" fill="currentColor" stroke="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="15" cy="17" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <line x1="11" y1="18.3" x2="13" y2="18.3" />
    </svg>
  );
}
function IconVote() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M5 9h14v10H5z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      <line x1="12" y1="13" x2="12" y2="16" />
    </svg>
  );
}
function IconComment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M4 5h16v11H9l-4 4V5Z" />
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 4 21 19H3L12 4Z" />
      <line x1="12" y1="10" x2="12" y2="14.5" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2.06 2.06 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V20a2.06 2.06 0 1 1-4.12 0v-.1a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2.06 2.06 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H4a2.06 2.06 0 1 1 0-4.12h.1a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.06 2.06 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1.03-1.56V4a2.06 2.06 0 1 1 4.12 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.06 2.06 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.56 1.03H20a2.06 2.06 0 1 1 0 4.12h-.1a1.7 1.7 0 0 0-1.56 1.03Z" />
    </svg>
  );
}

type NovelData = {
  id: number;
  title: string;
  author?: string | null;
  cover_url: string | null;
  category: string | null;
  status?: string | null;
  created_at: string;
};

type ChapterData = {
  chapter_number: number;
  title: string | null;
  content: string;
  created_at: string;
};

function RailChip({
  icon,
  label,
  href,
  onClick,
  disabled,
  active,
  title,
  compact,
  imageIcon,
  chipBg,
  chipText,
  activeBg,
  activeText,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  compact?: boolean;
  imageIcon?: boolean;
  chipBg: string;
  chipText: string;
  activeBg: string;
  activeText: string;
}) {
  const style = imageIcon
    ? { opacity: disabled ? 0.4 : 1 }
    : {
        backgroundColor: active ? activeBg : chipBg,
        color: disabled ? chipText + "80" : active ? activeText : chipText,
      };

  const inner = (
    <>
      <span aria-hidden className="flex items-center justify-center leading-none">
        {icon}
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-[10px] leading-none">{label}</span>
      )}
    </>
  );

  const className = imageIcon
    ? "flex flex-col items-center justify-center gap-1 transition-opacity"
    : compact
      ? "flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
      : "flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-2.5 transition-colors lg:px-2 lg:py-3";

  if (href && !disabled) {
    return (
      <a href={href} title={title} style={style} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
      className={className + (disabled ? " cursor-not-allowed" : "")}
    >
      {inner}
    </button>
  );
}

export default function ChapterPageClient({
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
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [fontFamilyId, setFontFamilyId] = useState<ReaderFontId>("sans");
  const [widthId, setWidthId] = useState<ReaderWidthId>("auto");
  const [showAuthorNote, setShowAuthorNote] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.theme) setTheme(saved.theme);
        if (typeof saved.fontSizeIdx === "number") setFontSizeIdx(saved.fontSizeIdx);
        if (saved.fontFamilyId) setFontFamilyId(saved.fontFamilyId);
        if (saved.widthId) setWidthId(saved.widthId);
        if (typeof saved.showAuthorNote === "boolean") setShowAuthorNote(saved.showAuthorNote);
      }
    } catch {
      // ignore — defaults are fine
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, fontSizeIdx, fontFamilyId, widthId, showAuthorNote })
      );
    } catch {
      // ignore persistence failures
    }
  }, [theme, fontSizeIdx, fontFamilyId, widthId, showAuthorNote, mounted]);

  const p = READER_PALETTES[theme];
  const fontSize = FONT_SIZES[fontSizeIdx];
  const fontFamily = READER_FONTS.find((f) => f.id === fontFamilyId)?.family;
  const contentMaxWidth = READER_WIDTHS.find((w) => w.id === widthId)?.px;


  const publishDate = new Date(novel.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const chipProps = {
    chipBg: p.chipBg,
    chipText: p.chipText,
    activeBg: p.chipActiveBg,
    activeText: p.chipActiveText,
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: p.pageBg, color: p.text, fontFamily }}
    >
      <div className="mx-auto flex max-w-shell flex-col gap-3 px-3 py-4">
        {/* Breadcrumb */}
        <div
          className="flex items-center justify-between text-[11px]"
          style={{ color: p.mutedText }}
        >
          <a href={`/novel/${novel.id}`} className="hover:underline">
            الرئيسية ‹ {novel.title}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {/* Main column */}
          <div
            className="min-w-0 flex-1 ps-14"
            style={contentMaxWidth ? { maxWidth: contentMaxWidth, marginInlineEnd: "auto" } : undefined}
          >
            {/* Book info card — bordered, matches qidian's outlined panel */}
            <div
              className="mb-3 flex flex-col items-center gap-2 rounded-2xl border px-5 py-6 text-center"
              style={{ borderColor: p.cardBorder }}
            >
              {novel.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={novel.cover_url}
                  alt={novel.title}
                  className="h-32 w-24 rounded object-cover shadow"
                />
              ) : (
                <span
                  className="flex h-32 w-24 items-center justify-center rounded text-[11px]"
                  style={{ backgroundColor: p.chipBg, color: p.mutedText }}
                >
                  الغلاف
                </span>
              )}

              <h1 className="mt-1 text-xl font-bold">{novel.title}</h1>
              {novel.author && (
                <p className="text-[12px]" style={{ color: p.mutedText }}>
                  {novel.author}著
                </p>
              )}

              <div
                className="mt-3 grid w-full grid-cols-3 divide-x divide-x-reverse pt-3"
                style={{ borderTop: `1px solid ${p.divider}` }}
              >
                <div>
                  <p className="text-sm font-bold">{novel.category || "—"}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: p.mutedText }}>
                    التصنيف
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">{publishDate}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: p.mutedText }}>
                    تاريخ النشر
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {novel.status === "completed" ? "مكتملة" : "مستمرة"}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: p.mutedText }}>
                    الحالة
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement line — honest zero state, styled as a divider row not a filled box */}
            <div
              className="mb-3 flex items-center justify-between border-y px-1 py-2 text-[12px]"
              style={{ borderColor: p.divider, color: p.mutedText }}
            >
              <span className="flex items-center gap-1.5">
                <IconComment />
                لا توجد تعليقات على هذا الفصل بعد
              </span>
              <button
                type="button"
                disabled
                title="حفظ الفصل — يتطلب حساب (قريبًا)"
                className="opacity-60"
              >
                <IconBookmark />
              </button>
            </div>

            {/* Chapter content */}
            <div className="mb-3">
              <div className="mb-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-4 w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: p.chipActiveText }}
                  />
                  <span
                    className="font-bold"
                    style={{ fontSize: fontSize - 1, color: p.mutedText }}
                  >
                    الفصل {chapter.chapter_number}
                  </span>
                </div>
                {chapter.title && (
                  <div className="mt-2 flex items-start gap-2.5">
                    <span
                      className="mt-1 h-6 w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: p.chipActiveText }}
                    />
                    <h2
                      className="font-bold leading-snug"
                      style={{ fontSize: fontSize + 8 }}
                    >
                      {chapter.title}
                    </h2>
                  </div>
                )}
              </div>
              <div className="text-justify" style={{ fontSize }}>
                {chapter.content
                  .split(/\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className="mb-4 indent-8 leading-loose">
                      {para}
                    </p>
                  ))}
              </div>
            </div>

            {/* Author note — honest empty state, can be hidden via settings */}
            {showAuthorNote && (
              <div
                className="mb-3 rounded-2xl border px-4 py-3"
                style={{ borderColor: p.cardBorder }}
              >
                <p className="mb-1 text-[11px] font-semibold" style={{ color: p.mutedText }}>
                  كلمة الكاتب{novel.author ? ` — ${novel.author}` : ""}
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: p.mutedText }}>
                  لا توجد ملاحظة من الكاتب على هذا الفصل بعد.
                </p>
              </div>
            )}

            {/* Support / tip — honest zero state */}
            <div
              className="mb-3 flex flex-col items-center gap-2 rounded-2xl border py-6"
              style={{ borderColor: p.cardBorder }}
            >
              <button
                type="button"
                disabled
                title="الدعم المادي غير متاح بعد"
                className="rounded-full px-8 py-2 text-sm font-bold opacity-60"
                style={{ backgroundColor: p.chipActiveText, color: "#fff" }}
              >
                دعم الكاتب · 0
              </button>
              <p className="text-[11px]" style={{ color: p.mutedText }}>
                لا يوجد داعمون لهذا الفصل بعد
              </p>
            </div>

            {/* Bottom nav */}
            <div
              className="flex items-center justify-between rounded-2xl border p-2"
              style={{ borderColor: p.cardBorder }}
            >
              {prevNumber >= 1 ? (
                <a
                  href={`/novel/${novel.id}/chapter/${prevNumber}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium"
                  style={{ backgroundColor: p.chipBg, color: p.chipText }}
                >
                  → الفصل السابق
                </a>
              ) : (
                <span className="px-3 py-2 text-sm opacity-40">→ الفصل السابق</span>
              )}

              <a
                href={`/novel/${novel.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium"
                style={{ backgroundColor: p.chipBg, color: p.chipText }}
              >
                الفهرس
              </a>

              <a
                href={`/novel/${novel.id}/chapter/${nextNumber}`}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white"
                style={{ backgroundColor: p.chipActiveText }}
              >
                الفصل التالي ←
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right icon rail — real icons matching reference exactly, transparent background */}
      <div className="fixed right-2 top-1/2 z-20 flex -translate-y-1/2 transform-gpu flex-col gap-2" style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}>
        <RailChip
          icon={<img src={theme === "quiet" ? "/icons/list.png" : "/icons/list-light.png"} alt="" className="h-11 w-11 object-contain" />}
          label="الفهرس"
          href={`/novel/${novel.id}`}
          title="الفهرس الكامل"
          imageIcon
          {...chipProps}
        />
        <RailChip
          icon={<img src={theme === "quiet" ? "/icons/book.png" : "/icons/book-light.png"} alt="" className="h-11 w-11 object-contain" />}
          label="التفاصيل"
          href={`/novel/${novel.id}`}
          title="تفاصيل الرواية"
          imageIcon
          {...chipProps}
        />
        <RailChip
          icon={<img src={theme === "quiet" ? "/icons/shelf.png" : "/icons/shelf-light.png"} alt="" className="h-11 w-11 object-contain" />}
          label="المكتبة"
          disabled
          title="يتطلب تسجيل دخول (قريبًا)"
          imageIcon
          {...chipProps}
        />
        <RailChip
          icon={<img src={theme === "quiet" ? "/icons/vote.png" : "/icons/vote-light.png"} alt="" className="h-11 w-11 object-contain" />}
          label="التصويت"
          href={`/novel/${novel.id}`}
          title="التصويت غير مفعّل بعد"
          imageIcon
          {...chipProps}
        />
        <RailChip
          icon={<img src={theme === "quiet" ? "/icons/sliders.png" : "/icons/sliders-light.png"} alt="" className="h-11 w-11 object-contain" />}
          label="الإعدادات"
          onClick={() => setSettingsOpen(true)}
          title="إعدادات القراءة"
          imageIcon
          {...chipProps}
        />
      </div>

      {/* Left feedback rail — fixed, desktop only, matches qidian's left strip */}
      <div
        className="fixed bottom-6 left-2 z-10 hidden transform-gpu flex-col gap-1.5 rounded-lg p-1 lg:flex"
        style={{ backgroundColor: p.chipBg, WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
      >
        <a
          href="mailto:contact@novelwolrd.com?subject=إبلاغ عن مشكلة"
          title="إبلاغ عن مشكلة بهذا الفصل"
          className="flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px]"
          style={{ color: p.chipText }}
        >
          <IconWarning />
          إبلاغ
        </a>
        <a
          href="mailto:contact@novelwolrd.com?subject=ملاحظات"
          title="إرسال ملاحظات"
          className="flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px]"
          style={{ color: p.chipText }}
        >
          <IconComment />
          ملاحظات
        </a>
      </div>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          fontSizeIdx={fontSizeIdx}
          setFontSizeIdx={setFontSizeIdx}
          fontSizes={FONT_SIZES}
          fontFamilyId={fontFamilyId}
          setFontFamilyId={setFontFamilyId}
          widthId={widthId}
          setWidthId={setWidthId}
          showAuthorNote={showAuthorNote}
          setShowAuthorNote={setShowAuthorNote}
        />
      )}
    </div>
  );
}
