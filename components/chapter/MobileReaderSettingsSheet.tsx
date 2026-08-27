"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

function IconThemes() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3.5h9l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5A1.5 1.5 0 0 1 6.5 3.5Z" />
      <path d="M15 3.5V8h4" />
    </svg>
  );
}
function IconAppearance() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17V3.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconSunSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="4.5" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </g>
    </svg>
  );
}
function IconSunLarge() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="5.5" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 1.5v2.6M12 19.9v2.6M3.5 3.5l1.85 1.85M18.65 18.65l1.85 1.85M1.5 12h2.6M19.9 12h2.6M3.5 20.5l1.85-1.85M18.65 5.35l1.85-1.85" />
      </g>
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1.03-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1.03h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03Z" />
    </svg>
  );
}

const THEME_ORDER: ReaderTheme[] = ["original", "quiet", "paper", "bold", "calm", "focus"];
const THEME_LABEL_EN: Record<ReaderTheme, string> = {
  original: "Original",
  quiet: "Quiet",
  paper: "Paper",
  bold: "Bold",
  calm: "Calm",
  focus: "Focus",
};

export default function MobileReaderSettingsSheet({
  theme,
  setTheme,
  fontIdx,
  setFontIdx,
  fontSizes,
  brightness,
  setBrightness,
  onClose,
  onCustomize,
}: {
  theme: ReaderTheme;
  setTheme: (t: ReaderTheme) => void;
  fontIdx: number;
  setFontIdx: (fn: (i: number) => number) => void;
  fontSizes: number[];
  brightness: number; // 0..100
  setBrightness: (n: number) => void;
  onClose: () => void;
  onCustomize: () => void;
}) {
  const p = READER_PALETTES[theme];

  // حركة دخول/خروج سلسة: يبدأ منزلق للأسفل وشفاف، ثم يترفع لمكانه بعد أول رسمة
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    window.setTimeout(onClose, 260);
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-black/40 transition-opacity duration-[260ms] ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-label="الثيمات والإعدادات"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
        className={`w-full max-w-md rounded-t-[22px] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 transition-transform duration-[280ms] ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ backgroundColor: "#f2f2f2", color: "#1a1a1a" }}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">الثيمات والإعدادات</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-[13px]"
          >
            ✕
          </button>
        </div>

        {/* الصف الأول: تصغير/تكبير الخط، الثيمات، المظهر */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
            disabled={fontIdx === 0}
            className="flex flex-col items-center gap-1"
          >
            <span className="mobile-reader-pill flex w-full items-center justify-center text-[15px] font-bold disabled:opacity-30">
              A
            </span>
            <span className="text-[10px] text-black/55">Font Size Decrease</span>
          </button>
          <button
            type="button"
            onClick={() => setFontIdx((i) => Math.min(fontSizes.length - 1, i + 1))}
            disabled={fontIdx === fontSizes.length - 1}
            className="flex flex-col items-center gap-1"
          >
            <span className="mobile-reader-pill flex w-full items-center justify-center text-[21px] font-bold disabled:opacity-30">
              A
            </span>
            <span className="text-[10px] text-black/55">Font Size Increase</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-1">
            <span className="mobile-reader-pill flex w-full items-center justify-center">
              <IconThemes />
            </span>
            <span className="text-[10px] text-black/55">Themes</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === "quiet" ? "original" : "quiet")}
            className="flex flex-col items-center gap-1"
          >
            <span className="mobile-reader-pill flex w-full items-center justify-center">
              <IconAppearance />
            </span>
            <span className="text-[10px] text-black/55">Appearance</span>
          </button>
        </div>

        {/* شريط السطوع */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <IconSunSmall />
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="mobile-reader-brightness flex-1"
            style={{ ["--val" as string]: brightness } as React.CSSProperties}
            aria-label="Brightness"
          />
          <IconSunLarge />
        </div>
        <p className="mt-1 text-center text-[11px] text-black/45">Brightness Slider</p>

        {/* شبكة الثيمات */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {THEME_ORDER.map((t) => {
            const tp = READER_PALETTES[t];
            const selected = t === theme;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className="mobile-reader-swatch flex flex-col items-center justify-center gap-2"
                style={{
                  backgroundColor: tp.pageBg,
                  border: selected ? "3px solid #000" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span
                  style={{
                    color: tp.text,
                    fontWeight: tp.boldText ? 800 : 600,
                    fontFamily: tp.swatchFontFamily || "Georgia, 'Times New Roman', serif",
                    fontSize: 22,
                  }}
                >
                  Aa
                </span>
                <span className="text-[10.5px] font-medium" style={{ color: tp.text }}>
                  {THEME_LABEL_EN[t]}
                </span>
              </button>
            );
          })}
        </div>

        {/* زر تخصيص */}
        <button
          type="button"
          onClick={() => {
            handleClose();
            onCustomize();
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-black/[0.06] py-2.5 text-[13px] font-bold"
        >
          <IconGear />
          تخصيص
        </button>
      </div>
    </div>
  );
}
