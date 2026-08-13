"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "night" | "sepia";

const THEME_STYLES: Record<Theme, { bg: string; text: string; border: string }> = {
  light: { bg: "#ffffff", text: "#191919", border: "rgba(153,153,153,0.15)" },
  night: { bg: "#1c1c1e", text: "#d4d4d8", border: "rgba(255,255,255,0.08)" },
  sepia: { bg: "#f4ecd8", text: "#433422", border: "rgba(67,52,34,0.15)" },
};

const FONT_SIZES = [15, 17, 19, 21, 23];
const STORAGE_KEY = "novelwolrd-reader-prefs";

function RailButton({
  icon,
  label,
  onClick,
  href,
  active,
  disabled,
  title,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const className = `flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] ${
    disabled
      ? "cursor-not-allowed text-ink-300/60"
      : active
        ? "text-brand"
        : "text-ink-500 hover:text-brand"
  }`;

  const content = (
    <>
      <span aria-hidden className="text-base">
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} title={title} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {content}
    </button>
  );
}

export default function ChapterReaderClient({
  novelId,
  chapterTitle,
  chapterNumber,
  content,
}: {
  novelId: number | string;
  chapterTitle: string | null;
  chapterNumber: number;
  content: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");
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
      // localStorage unavailable — fall back to defaults silently
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, fontSizeIdx })
      );
    } catch {
      // ignore persistence failures
    }
  }, [theme, fontSizeIdx, mounted]);

  const styles = THEME_STYLES[theme];
  const fontSize = FONT_SIZES[fontSizeIdx];

  const cycleFontSize = (dir: 1 | -1) => {
    setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, Math.max(0, i + dir)));
  };

  const cycleTheme = () => {
    setTheme((t) => (t === "light" ? "night" : t === "night" ? "sepia" : "light"));
  };

  const themeLabel =
    theme === "light" ? "الوضع النهاري" : theme === "night" ? "الوضع الليلي" : "وضع القراءة الدافئ";

  return (
    <div className="flex items-start gap-2">
      {/* Right-hand floating rail (matches qidian's fixed sidebar) — becomes a horizontal strip on small screens */}
      <div className="order-2 flex shrink-0 flex-row gap-1 rounded bg-white border border-ink-300/15 p-1 lg:sticky lg:top-4 lg:flex-col lg:gap-2 lg:p-2">
        <RailButton icon="📖" label="الفهرس" href={`/novel/${novelId}`} title="الفهرس الكامل" />
        <RailButton icon="ℹ️" label="تفاصيل" href={`/novel/${novelId}`} title="تفاصيل الرواية" />
        <RailButton
          icon="➕"
          label="المكتبة"
          disabled
          title="إضافة للمكتبة — يتطلب تسجيل دخول (قريبًا)"
        />
        <RailButton
          icon="🗳️"
          label="التصويت"
          href={`/novel/${novelId}`}
          title="التصويت غير مفعّل بعد"
        />
        <RailButton
          icon={theme === "night" ? "🌙" : theme === "sepia" ? "☕" : "☀️"}
          label={themeLabel}
          onClick={cycleTheme}
          active
          title="تبديل وضع القراءة"
        />
        <div className="flex flex-row items-center gap-1 lg:flex-col">
          <button
            type="button"
            onClick={() => cycleFontSize(1)}
            disabled={fontSizeIdx === FONT_SIZES.length - 1}
            title="تكبير الخط"
            className="px-2 py-1 text-sm font-bold text-ink-500 hover:text-brand disabled:opacity-30"
          >
            أ+
          </button>
          <button
            type="button"
            onClick={() => cycleFontSize(-1)}
            disabled={fontSizeIdx === 0}
            title="تصغير الخط"
            className="px-2 py-1 text-xs font-bold text-ink-500 hover:text-brand disabled:opacity-30"
          >
            أ-
          </button>
        </div>
      </div>

      {/* Reading content */}
      <div
        className="order-1 min-w-0 flex-1 rounded p-4 border transition-colors"
        style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}
      >
        <h1 className="mb-4 text-lg font-bold" style={{ fontSize: fontSize + 4 }}>
          الفصل {chapterNumber}
          {chapterTitle ? ` — ${chapterTitle}` : ""}
        </h1>
        <div
          className="whitespace-pre-wrap leading-loose"
          style={{ fontSize }}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
