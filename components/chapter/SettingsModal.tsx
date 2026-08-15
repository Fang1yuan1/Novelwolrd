"use client";

import {
  READER_PALETTES,
  READER_FONTS,
  READER_WIDTHS,
  type ReaderTheme,
  type ReaderFontId,
  type ReaderWidthId,
} from "@/lib/reader-theme";

export default function SettingsModal({
  onClose,
  theme,
  setTheme,
  fontSizeIdx,
  setFontSizeIdx,
  fontSizes,
  fontFamilyId,
  setFontFamilyId,
  widthId,
  setWidthId,
  showAuthorNote,
  setShowAuthorNote,
}: {
  onClose: () => void;
  theme: ReaderTheme;
  setTheme: (t: ReaderTheme) => void;
  fontSizeIdx: number;
  setFontSizeIdx: (fn: (i: number) => number) => void;
  fontSizes: number[];
  fontFamilyId: ReaderFontId;
  setFontFamilyId: (id: ReaderFontId) => void;
  widthId: ReaderWidthId;
  setWidthId: (id: ReaderWidthId) => void;
  showAuthorNote: boolean;
  setShowAuthorNote: (v: boolean) => void;
}) {
  const p = READER_PALETTES[theme];

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl p-4 sm:rounded-2xl"
        style={{ backgroundColor: p.pageBg, color: p.text }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">الإعدادات</h2>
          <button type="button" onClick={onClose} className="text-lg leading-none opacity-70">
            ×
          </button>
        </div>

        {/* وضع القراءة */}
        <div className="mb-4">
          <p className="mb-2 text-[12px]" style={{ color: p.mutedText }}>
            وضع القراءة
          </p>
          <div className="flex gap-3">
            {(Object.keys(READER_PALETTES) as ReaderTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                title={READER_PALETTES[t].label}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="h-8 w-8 rounded-full border-2"
                  style={{
                    backgroundColor: READER_PALETTES[t].swatch,
                    borderColor: t === theme ? p.chipActiveText : "transparent",
                  }}
                />
                <span className="text-[10px]" style={{ color: p.mutedText }}>
                  {READER_PALETTES[t].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* الخط */}
        <div className="mb-4">
          <p className="mb-2 text-[12px]" style={{ color: p.mutedText }}>
            نوع الخط
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {READER_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontFamilyId(f.id)}
                style={{
                  backgroundColor: f.id === fontFamilyId ? p.chipActiveBg : p.chipBg,
                  color: f.id === fontFamilyId ? p.chipActiveText : p.chipText,
                  fontFamily: f.family,
                }}
                className="rounded-lg py-2 text-[12px] font-medium"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* حجم الخط */}
        <div className="mb-4">
          <p className="mb-2 text-[12px]" style={{ color: p.mutedText }}>
            حجم الخط
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
              disabled={fontSizeIdx === 0}
              style={{ backgroundColor: p.chipBg, color: p.chipText }}
              className="flex-1 rounded-lg py-2 text-xs font-bold disabled:opacity-30"
            >
              أ-
            </button>
            <span
              className="w-12 text-center text-sm font-bold"
              style={{ color: p.text }}
            >
              {fontSizes[fontSizeIdx]}
            </span>
            <button
              type="button"
              onClick={() =>
                setFontSizeIdx((i) => Math.min(fontSizes.length - 1, i + 1))
              }
              disabled={fontSizeIdx === fontSizes.length - 1}
              style={{ backgroundColor: p.chipBg, color: p.chipText }}
              className="flex-1 rounded-lg py-2 text-sm font-bold disabled:opacity-30"
            >
              أ+
            </button>
          </div>
        </div>

        {/* عرض الصفحة */}
        <div className="mb-4">
          <p className="mb-2 text-[12px]" style={{ color: p.mutedText }}>
            عرض الصفحة
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {READER_WIDTHS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setWidthId(w.id)}
                style={{
                  backgroundColor: w.id === widthId ? p.chipActiveBg : p.chipBg,
                  color: w.id === widthId ? p.chipActiveText : p.chipText,
                }}
                className="rounded-lg py-2 text-[12px] font-medium"
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* إظهار ملاحظة الكاتب */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium" style={{ color: p.text }}>
              إظهار ملاحظة الكاتب
            </p>
            <p className="text-[11px]" style={{ color: p.mutedText }}>
              يظهر قسم كلمة الكاتب أسفل كل فصل
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showAuthorNote}
            onClick={() => setShowAuthorNote(!showAuthorNote)}
            style={{ backgroundColor: showAuthorNote ? p.chipActiveText : p.chipBg }}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
              style={{ [showAuthorNote ? "right" : "left"]: "2px" } as React.CSSProperties}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
