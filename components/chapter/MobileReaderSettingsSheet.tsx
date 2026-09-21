"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

// لوحة الثيمات والإعدادات — مبنية على لقطة آبل بوكس بدقة 828×1792 (1 بكسل لقطة = 1u = 100vw/828)،
// وكل الأيقونات مقصوصة من اللقطة نفسها (public/icons/reader/*.png) وتاخد لون النص الحالي (mask).
function MaskIcon({ name, w, h }: { name: string; w: number; h: number }) {
  const url = `url(/icons/reader/${name}.png)`;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: `calc(${w} * var(--u))`,
        height: `calc(${h} * var(--u))`,
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
const IconLayout = () => <MaskIcon name="layout" w={49} h={48} />;
const IconAppearance = () => <MaskIcon name="appearance" w={46} h={46} />;
const IconSunSmall = () => <MaskIcon name="sun-small" w={37} h={37} />;
const IconSunLarge = () => <MaskIcon name="sun-large" w={40} h={40} />;
const IconClose = () => <MaskIcon name="close" w={30} h={30} />;
const IconAsterisk = () => <MaskIcon name="asterisk" w={21} h={23} />;
function IconGear() {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: "calc(41 * var(--u))",
        height: "calc(41 * var(--u))",
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
// ألوان المربعات مأخوذة من لقطة المرجع بالضبط
const SWATCH_BG: Record<ReaderTheme, string> = {
  original: "#ffffff",
  quiet: "#4a4a4c",
  paper: "#eeeded",
  bold: "#ffffff",
  calm: "#eee2cc",
  focus: "#fefcf5",
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
  // ألوان اللقطة: اللوحة #f4f4f4، الكبسولات #e3e3e5، الشريط: تعبئة #69696e وفراغ #dedddf، الخط الفاصل #bebebe
  const panelBg = theme === "original" ? "#f4f4f4" : p.pageBg;
  const pillTint = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const closeTint = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";
  const sliderInk = isDark ? p.mutedText : "#69696e";
  const sliderEmpty = isDark ? "rgba(255,255,255,0.14)" : "#dedddf";
  const dividerTint = isDark ? "rgba(255,255,255,0.14)" : "#bebebe";

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
        style={{ backgroundColor: panelBg, color: p.text }}
      >
        {/* العنوان وزر الإغلاق (بقيا بمكانهما) */}
        <div className="nw-rs-head">
          <h2 className="nw-rs-title">الثيمات والإعدادات</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="nw-rs-close"
            style={{ backgroundColor: closeTint, color: p.mutedText }}
          >
            <IconClose />
          </button>
        </div>

        {/* الأدوات بترتيب المرجع بالضبط (يسار→يمين) لذلك dir=ltr */}
        <div dir="ltr">
          <div className="nw-rs-pills">
            <div className="nw-rs-pill nw-rs-pill--font" style={{ backgroundColor: pillTint, color: p.text }}>
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

            <button type="button" className="nw-rs-pill nw-rs-pill--icon" style={{ backgroundColor: pillTint, color: p.text }} aria-label="التخطيط">
              <IconLayout />
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "quiet" ? "original" : "quiet")}
              className="nw-rs-pill nw-rs-pill--icon"
              style={{ backgroundColor: pillTint, color: p.text }}
              aria-label="المظهر"
            >
              <IconAppearance />
            </button>
          </div>

          {/* شريط السطوع: بدون مقبض ظاهر زي المرجع، يتحرك بالسحب على الشريط */}
          <div className="nw-rs-brightness" style={{ color: sliderInk }}>
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
                  "--fill": sliderInk,
                  "--empty": sliderEmpty,
                } as React.CSSProperties
              }
              aria-label="سطوع الشاشة"
            />
            <IconSunLarge />
          </div>
          <div className="nw-rs-divider" style={{ backgroundColor: dividerTint }} />

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
                    backgroundColor: SWATCH_BG[t],
                    border: selected
                      ? "calc(6 * var(--u)) solid #000"
                      : "calc(1 * var(--u)) solid rgba(0,0,0,0.09)",
                    color: t === "quiet" ? "#9a9a9e" : tp.text,
                  }}
                >
                  {t === "original" && (
                    <span className="nw-rs-asterisk" style={{ color: "#8e8e93" }}>
                      <IconAsterisk />
                    </span>
                  )}
                  <span
                    className="nw-rs-swatch-aa"
                    style={{
                      fontWeight: tp.boldText ? 700 : 500,
                      fontFamily: tp.swatchFontFamily || "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    Aa
                  </span>
                  {/* الاسم بنفس خط الـAa (سيريف/سانس) زي المرجع */}
                  <span
                    className="nw-rs-swatch-label"
                    style={{
                      fontWeight: tp.boldText ? 700 : 400,
                      fontFamily: tp.swatchFontFamily || "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    {THEME_LABEL_EN[t]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* زر تخصيص: أضيق من العرض ومتوسّط، زي المرجع */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              onCustomize();
            }}
            className="nw-rs-customize"
            style={{ backgroundColor: pillTint, color: p.text }}
          >
            <IconGear />
            تخصيص
          </button>
        </div>
      </div>
    </div>
  );
}
