"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

const FONT_SIZES = [15, 17, 19, 21, 23];
const STORAGE_KEY = "novelwolrd-reader-prefs";

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
  chipBg,
  chipText,
  activeBg,
  activeText,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
  chipBg: string;
  chipText: string;
  activeBg: string;
  activeText: string;
}) {
  const style = {
    backgroundColor: active ? activeBg : chipBg,
    color: disabled ? chipText + "80" : active ? activeText : chipText,
  };

  const inner = (
    <>
      <span aria-hidden className="text-base leading-none">
        {icon}
      </span>
      <span className="whitespace-nowrap text-[10px] leading-none">{label}</span>
    </>
  );

  const className =
    "flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-2.5 transition-colors lg:px-2 lg:py-3";

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
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.theme) setTheme(saved.theme);
        if (typeof saved.fontSizeIdx === "number") setFontSizeIdx(saved.fontSizeIdx);
      }
    } catch {
      // ignore — defaults are fine
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, fontSizeIdx }));
    } catch {
      // ignore persistence failures
    }
  }, [theme, fontSizeIdx, mounted]);

  const p = READER_PALETTES[theme];
  const fontSize = FONT_SIZES[fontSizeIdx];

  const cycleFontSize = (dir: 1 | -1) =>
    setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, Math.max(0, i + dir)));

  const cycleTheme = () =>
    setTheme((t) => (t === "light" ? "night" : t === "night" ? "sepia" : "light"));

  const themeIcon = theme === "night" ? "🌙" : theme === "sepia" ? "☕" : "☀️";
  const themeLabel = theme === "night" ? "ليلي" : theme === "sepia" ? "دافئ" : "نهاري";

  const publishDate = new Date(novel.created_at).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const wordCount = chapter.content ? chapter.content.length : 0;

  const chipProps = {
    chipBg: p.chipBg,
    chipText: p.chipText,
    activeBg: p.chipActiveBg,
    activeText: p.chipActiveText,
  };

  return (
    <div
      className="min-h-screen transition-colors"
      style={{ backgroundColor: p.pageBg, color: p.text }}
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          {/* Right icon rail — sits beside content on desktop (RTL: first child = right side), stacks on top on mobile */}
          <div className="grid grid-cols-4 gap-1.5 lg:sticky lg:top-4 lg:grid-cols-1 lg:w-20 lg:shrink-0 lg:gap-2">
            <RailChip icon="📖" label="الفهرس" href={`/novel/${novel.id}`} title="الفهرس الكامل" {...chipProps} />
            <RailChip icon="ℹ️" label="التفاصيل" href={`/novel/${novel.id}`} title="تفاصيل الرواية" {...chipProps} />
            <RailChip
              icon="➕"
              label="المكتبة"
              disabled
              title="يتطلب تسجيل دخول (قريبًا)"
              {...chipProps}
            />
            <RailChip icon="🗳️" label="التصويت" href={`/novel/${novel.id}`} title="التصويت غير مفعّل بعد" {...chipProps} />
            <RailChip
              icon={themeIcon}
              label={themeLabel}
              onClick={cycleTheme}
              active
              title="تبديل وضع القراءة"
              {...chipProps}
            />
            <div className="col-span-2 grid grid-cols-2 gap-1.5 lg:col-span-1 lg:grid-cols-1">
              <button
                type="button"
                onClick={() => cycleFontSize(1)}
                disabled={fontSizeIdx === FONT_SIZES.length - 1}
                title="تكبير الخط"
                style={{ backgroundColor: p.chipBg, color: p.chipText }}
                className="rounded-lg px-2.5 py-2.5 text-sm font-bold disabled:opacity-30 lg:py-2"
              >
                حجم الخط أ+
              </button>
              <button
                type="button"
                onClick={() => cycleFontSize(-1)}
                disabled={fontSizeIdx === 0}
                title="تصغير الخط"
                style={{ backgroundColor: p.chipBg, color: p.chipText }}
                className="rounded-lg px-2.5 py-2.5 text-xs font-bold disabled:opacity-30 lg:py-2"
              >
                أ-
              </button>
            </div>
          </div>

          {/* Main column */}
          <div className="min-w-0 flex-1">
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
                <span aria-hidden>💬</span>
                لا توجد تعليقات على هذا الفصل بعد
              </span>
              <button
                type="button"
                disabled
                title="حفظ الفصل — يتطلب حساب (قريبًا)"
                className="text-base opacity-60"
              >
                🔖
              </button>
            </div>

            {/* Chapter content */}
            <div className="mb-3">
              <h2 className="mb-4 text-lg font-bold" style={{ fontSize: fontSize + 4 }}>
                الفصل {chapter.chapter_number}
                {chapter.title ? ` — ${chapter.title}` : ""}
                <span
                  className="mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-[11px] font-normal"
                  style={{ backgroundColor: p.chipBg, color: p.mutedText }}
                >
                  {wordCount.toLocaleString("ar-EG")} حرف
                </span>
              </h2>
              <div className="whitespace-pre-wrap leading-loose" style={{ fontSize }}>
                {chapter.content}
              </div>
            </div>

            {/* Author note — honest empty state */}
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

      {/* Left feedback rail — fixed, desktop only, matches qidian's left strip */}
      <div
        className="fixed bottom-6 left-2 z-10 hidden flex-col gap-1.5 rounded-lg p-1 lg:flex"
        style={{ backgroundColor: p.chipBg }}
      >
        <a
          href="mailto:contact@novelwolrd.com?subject=إبلاغ عن مشكلة"
          title="إبلاغ عن مشكلة بهذا الفصل"
          className="flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px]"
          style={{ color: p.chipText }}
        >
          <span aria-hidden className="text-base">
            ⚠️
          </span>
          إبلاغ
        </a>
        <a
          href="mailto:contact@novelwolrd.com?subject=ملاحظات"
          title="إرسال ملاحظات"
          className="flex flex-col items-center gap-0.5 rounded px-2 py-2 text-[10px]"
          style={{ color: p.chipText }}
        >
          <span aria-hidden className="text-base">
            💬
          </span>
          ملاحظات
        </a>
      </div>
    </div>
  );
}
