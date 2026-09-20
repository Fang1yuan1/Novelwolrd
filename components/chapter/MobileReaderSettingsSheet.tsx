"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

// أيقونات اللوحة — مرسومة على شكل لقطة المرجع (آبل بوكس)
// ورقة بطرف ملفوف من أسفل اليمين
function IconThemes() {
  return (
    <svg width="19" height="24" viewBox="0 0 20 25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M5.2 1.5H14.8A3.7 3.7 0 0 1 18.5 5.2V15L9.6 23.5H5.2A3.7 3.7 0 0 1 1.5 19.8V5.2A3.7 3.7 0 0 1 5.2 1.5Z" />
      <path d="M9.4 15.4H16.4L9.4 22Z" />
    </svg>
  );
}
// تباين: نصف أسود ونصف بحلقة، وبمنتصفه نصف دائرة معكوس
function IconAppearance() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0.8A11.2 11.2 0 0 0 12 23.2V16.6A4.6 4.6 0 0 1 12 7.4Z" />
      <path d="M12 1.55A10.45 10.45 0 0 1 12 22.45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.4A4.6 4.6 0 0 1 12 16.6Z" />
    </svg>
  );
}
// شمس صغيرة: قرص وحوله 8 نقاط
function IconSunSmall() {
  const dots: [number, number][] = [
    [12, 1.5], [12, 22.5], [1.5, 12], [22.5, 12],
    [19.4, 4.6], [4.6, 4.6], [19.4, 19.4], [4.6, 19.4],
  ];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6.1" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" />
      ))}
    </svg>
  );
}
// شمس كبيرة: قرص وحوله 8 أشعة قصيرة
function IconSunLarge() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="5.1" />
      <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M12 1.9V3.6M12 20.4V22.1M1.9 12H3.6M20.4 12H22.1M4.86 4.86l1.2 1.2M17.94 17.94l1.2 1.2M4.86 19.14l1.2-1.2M17.94 6.06l1.2-1.2" />
      </g>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M2.6 2.6L13.4 13.4M13.4 2.6L2.6 13.4" />
    </svg>
  );
}
function IconGear() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-[15px] w-[15px] shrink-0"
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/icons/gear-icon.png)",
        maskImage: "url(/icons/gear-icon.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
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
  const isDark = theme === "quiet";
  const overlayTint = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const dividerTint = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const closeBtnTint = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  // لون اللوحة بالثيم الأصلي رمادي فاتح (#f2f2f2) زي المرجع، وباقي الثيمات بلون صفحتها. والحافة ظل رفيع حولها
  const panelBg = theme === "original" ? "#f2f2f2" : p.pageBg;
  const rimTint = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.20)";

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
      // اللوحة عائمة مش ملتصقة بالشاشة: هامش 10 يمين ويسار وأسفل (وفوق منطقة الأمان لو موجودة)
      style={{ padding: "0 10px max(10px, env(safe-area-inset-bottom))" }}
      onClick={handleClose}
      role="dialog"
      aria-label="الثيمات والإعدادات"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-[34px] px-[18px] pb-4 pt-[18px] transition-transform duration-[280ms] ease-out ${
          visible ? "translate-y-0" : "translate-y-[calc(100%+24px)]"
        }`}
        style={{
          backgroundColor: panelBg,
          color: p.text,
          border: `3px solid ${rimTint}`,
        }}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">الثيمات والإعدادات</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: closeBtnTint, color: p.mutedText }}
          >
            <IconClose />
          </button>
        </div>

        {/* الصف الأول: تصغير/تكبير الخط مجمّعين بكبسولة واحدة، الثيمات/المظهر مجمّعين بكبسولة تانية */}
        <div className="mt-3 flex gap-2">
          <div
            className="mobile-reader-pill-group flex flex-1"
            style={{ backgroundColor: overlayTint, color: p.text }}
          >
            <button
              type="button"
              onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              disabled={fontIdx === 0}
              className="flex flex-1 items-center justify-center py-3.5"
            >
              <span className="text-[18px] font-bold disabled:opacity-30">A</span>
            </button>
            <span className="mobile-reader-pill-divider" style={{ backgroundColor: dividerTint }} />
            <button
              type="button"
              onClick={() => setFontIdx((i) => Math.min(fontSizes.length - 1, i + 1))}
              disabled={fontIdx === fontSizes.length - 1}
              className="flex flex-1 items-center justify-center py-3.5"
            >
              <span className="text-[24px] font-bold disabled:opacity-30">A</span>
            </button>
          </div>

          <div
            className="mobile-reader-pill-group flex flex-1"
            style={{ backgroundColor: overlayTint, color: p.text }}
          >
            <button type="button" className="flex flex-1 items-center justify-center py-3.5">
              <IconThemes />
            </button>
            <span className="mobile-reader-pill-divider" style={{ backgroundColor: dividerTint }} />
            <button
              type="button"
              onClick={() => setTheme(theme === "quiet" ? "original" : "quiet")}
              className="flex flex-1 items-center justify-center py-3.5"
            >
              <IconAppearance />
            </button>
          </div>
        </div>

        {/* شريط السطوع */}
        <div className="mt-3.5 flex items-center gap-2.5" style={{ color: p.text }}>
          <IconSunSmall />
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="mobile-reader-brightness flex-1"
            style={
              {
                "--val": brightness,
                "--fill": p.text,
                "--empty": dividerTint,
                "--thumb-bg": p.pageBg,
              } as React.CSSProperties
            }
            aria-label="سطوع الشاشة"
          />
          <IconSunLarge />
        </div>
        <div className="mt-3 border-t" style={{ borderColor: dividerTint }} />

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
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold"
          style={{ backgroundColor: overlayTint, color: p.text }}
        >
          <IconGear />
          تخصيص
        </button>
      </div>
    </div>
  );
}
