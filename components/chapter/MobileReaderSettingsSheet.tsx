"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

// أيقونات اللوحة مقصوصة من لقطة المرجع نفسها (public/icons/reader/*.png) وتاخد لون النص الحالي (mask)،
// وأحجامها بالبكسل مقاسة من المرجع (1 بكسل مرجع = 0.462 بكسل شاشة).
function MaskIcon({ name, w, h }: { name: string; w: number; h: number }) {
  const url = `url(/icons/reader/${name}.png)`;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: w,
        height: h,
        backgroundColor: "currentColor",
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
}
const IconThemes = () => <MaskIcon name="themes" w={20.8} h={25.9} />;
const IconAppearance = () => <MaskIcon name="appearance" w={24.5} h={24.9} />;
const IconSunSmall = () => <MaskIcon name="sun-small" w={20.3} h={19.9} />;
const IconSunLarge = () => <MaskIcon name="sun-large" w={21.7} h={22.2} />;
const IconClose = () => <MaskIcon name="close" w={19.4} h={19.4} />;
function IconGear() {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: 18,
        height: 18,
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
      className={`nw-rs-overlay ${visible ? "is-open" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-label="الثيمات والإعدادات"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nw-rs-panel"
        style={{
          backgroundColor: panelBg,
          color: p.text,
          border: `3px solid ${rimTint}`,
        }}
      >
        <div className="nw-rs-head">
          <h2 className="nw-rs-title">الثيمات والإعدادات</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="nw-rs-close"
            style={{ backgroundColor: closeBtnTint, color: p.mutedText }}
          >
            <IconClose />
          </button>
        </div>

        {/* الصف الأول: كبسولة الخط (أعرض) + كبسولة الثيمات/المظهر (أضيق) */}
        <div className="nw-rs-pills">
          <div className="nw-rs-pill nw-rs-pill--wide" style={{ backgroundColor: overlayTint, color: p.text }}>
            <button
              type="button"
              onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              disabled={fontIdx === 0}
              className="nw-rs-pill-btn"
            >
              <span className="nw-rs-a-small">A</span>
            </button>
            <span className="nw-rs-pill-divider" style={{ backgroundColor: dividerTint }} />
            <button
              type="button"
              onClick={() => setFontIdx((i) => Math.min(fontSizes.length - 1, i + 1))}
              disabled={fontIdx === fontSizes.length - 1}
              className="nw-rs-pill-btn"
            >
              <span className="nw-rs-a-large">A</span>
            </button>
          </div>

          <div className="nw-rs-pill nw-rs-pill--narrow" style={{ backgroundColor: overlayTint, color: p.text }}>
            <button type="button" className="nw-rs-pill-btn">
              <IconThemes />
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "quiet" ? "original" : "quiet")}
              className="nw-rs-pill-btn"
            >
              <IconAppearance />
            </button>
          </div>
        </div>

        {/* شريط السطوع */}
        <div className="nw-rs-brightness" style={{ color: p.text }}>
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
                "--thumb-bg": "#ffffff",
              } as React.CSSProperties
            }
            aria-label="سطوع الشاشة"
          />
          <IconSunLarge />
        </div>
        <div className="nw-rs-divider" style={{ borderColor: dividerTint }} />

        {/* شبكة الثيمات */}
        <div className="nw-rs-grid">
          {THEME_ORDER.map((t) => {
            const tp = READER_PALETTES[t];
            const selected = t === theme;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className="nw-rs-swatch"
                style={{
                  backgroundColor: tp.pageBg,
                  border: selected ? "3px solid #000" : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span
                  className="nw-rs-swatch-aa"
                  style={{
                    color: tp.text,
                    fontWeight: tp.boldText ? 800 : 600,
                    fontFamily: tp.swatchFontFamily || "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Aa
                </span>
                <span className="nw-rs-swatch-label" style={{ color: tp.text }}>
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
          className="nw-rs-customize"
          style={{ backgroundColor: overlayTint, color: p.text }}
        >
          <IconGear />
          تخصيص
        </button>
      </div>
    </div>
  );
}
