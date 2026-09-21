"use client";

import { useEffect, useRef, useState } from "react";
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

// شمس بطبقتين: الهادئة (رمادية) والنشطة (سوداء أكبر شوي) وبينهم تلاشي وقت اللمس — كلاهما مقصوص من المرجع
function SunIcon({ kind, active, activeColor }: { kind: "small" | "large"; active: boolean; activeColor: string }) {
  const size = kind === "small" ? { idle: [37, 37], on: [39, 37] } : { idle: [40, 40], on: [42, 40] };
  return (
    <span
      className="nw-rs-sun"
      style={{
        width: `calc(${size.idle[0]} * var(--u))`,
        height: `calc(${size.idle[1]} * var(--u))`,
        transform: active
          ? `translateX(calc(${kind === "small" ? -18.5 : 17.5} * var(--u)))`
          : "none",
      }}
    >
      <span className="nw-rs-sun-layer" style={{ opacity: active ? 0 : 1 }}>
        <MaskIcon name={kind === "small" ? "sun-small" : "sun-large"} w={size.idle[0]} h={size.idle[1]} />
      </span>
      <span className="nw-rs-sun-layer" style={{ opacity: active ? 1 : 0, color: activeColor }}>
        <MaskIcon name={kind === "small" ? "sun-small-active" : "sun-large-active"} w={size.on[0]} h={size.on[1]} />
      </span>
    </span>
  );
}

// شريط السطوع بأسلوب المرجع (زي تحكم iOS): عند اللمس يتضخّم الشريط (14→32) ويسوّد ويطلع له ظل تحته وتبعد الشمسين،
// والسحب نسبي (ما يقفز لمكان اللمس)، وبعد الرفع يرجع نحيفًا رماديًا.
function BrightnessSlider({
  value,
  onChange,
  onActiveChange,
  idleFill,
  idleEmpty,
  activeFill,
  activeEmpty,
}: {
  value: number;
  onChange: (n: number) => void;
  onActiveChange: (a: boolean) => void;
  idleFill: string;
  idleEmpty: string;
  activeFill: string;
  activeEmpty: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; v: number; w: number } | null>(null);
  const [active, setActive] = useState(false);

  function begin(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, v: value, w: el.getBoundingClientRect().width };
    setActive(true);
    onActiveChange(true);
  }
  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const next = d.v + ((e.clientX - d.x) / d.w) * 100;
    onChange(Math.round(Math.min(100, Math.max(0, next)) * 10) / 10);
  }
  function end() {
    if (!drag.current) return;
    drag.current = null;
    setActive(false);
    onActiveChange(false);
  }

  return (
    <div
      ref={ref}
      className={`nw-rs-slider${active ? " is-active" : ""}`}
      role="slider"
      tabIndex={0}
      aria-label="سطوع الشاشة"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(100, value + 5));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - 5));
      }}
    >
      <div className="nw-rs-shadow" style={{ width: `${value}%` }} />
      <div className="nw-rs-track" style={{ backgroundColor: active ? activeEmpty : idleEmpty }}>
        <div className="nw-rs-fill" style={{ width: `${value}%`, backgroundColor: active ? activeFill : idleFill }} />
      </div>
    </div>
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
  // زي المرجع بالضبط (فيديو + لقطة): لون اللوحة ما يتأثر بثيم الصفحة إلا لما يكون «Quiet» فتصير داكنة كلها.
  // ألوان الفاتح: اللوحة #f4f4f4، الكبسولات #e3e3e5، الشريط تعبئة #69696e وفراغ #dedddf، الفاصل #bebebe.
  // ألوان الداكن (Quiet): اللوحة #343134، الكبسولات #504d52، الإغلاق #444146، الشريط تعبئة #e8e7f1 وفراغ #5b585d، الفاصل #484548.
  const isDark = theme === "quiet";
  const panelBg = isDark ? "#343134" : "#f4f4f4";
  const ink = isDark ? "#fffdff" : "#000000";
  const pillTint = isDark ? "#504d52" : "#e3e3e5";
  const closeTint = isDark ? "#444146" : "#e5e5e6";
  const mutedInk = isDark ? "#b0afb5" : "#8e8e93";
  const sliderInk = isDark ? "#e8e7f1" : "#69696e";
  const sliderEmpty = isDark ? "#5b585d" : "#dedddf";
  const dividerTint = isDark ? "#484548" : "#bebebe";

  // حركة دخول/خروج سلسة: يبدأ منزلق للأسفل وشفاف، ثم يترفع لمكانه بعد أول رسمة
  const [visible, setVisible] = useState(false);
  const [sliding, setSliding] = useState(false); // لمس شريط السطوع: نخفّي التعتيم خلف اللوحة عشان ترى تأثير السطوع على الصفحة
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
      className={`nw-rs-overlay ${visible ? "is-open" : ""} ${sliding ? "is-live" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-label="الثيمات والإعدادات"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nw-rs-panel"
        style={{ backgroundColor: panelBg, color: ink }}
      >
        {/* العنوان وزر الإغلاق (بقيا بمكانهما) */}
        <div className="nw-rs-head">
          <h2 className="nw-rs-title">الثيمات والإعدادات</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="nw-rs-close"
            style={{ backgroundColor: closeTint, color: mutedInk }}
          >
            <IconClose />
          </button>
        </div>

        {/* الأدوات بترتيب المرجع بالضبط (يسار→يمين) لذلك dir=ltr */}
        <div dir="ltr">
          <div className="nw-rs-pills">
            <div className="nw-rs-pill nw-rs-pill--font" style={{ backgroundColor: pillTint, color: ink }}>
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

            <button type="button" className="nw-rs-pill nw-rs-pill--icon" style={{ backgroundColor: pillTint, color: ink }} aria-label="التخطيط">
              <IconLayout />
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "quiet" ? "original" : "quiet")}
              className="nw-rs-pill nw-rs-pill--icon"
              style={{ backgroundColor: pillTint, color: ink }}
              aria-label="المظهر"
            >
              <IconAppearance />
            </button>
          </div>

          {/* شريط السطوع: زي المرجع، يتضخّم ويسوّد عند اللمس */}
          <div className="nw-rs-brightness" style={{ color: sliderInk }}>
            <SunIcon kind="small" active={sliding} activeColor={ink} />
            <BrightnessSlider
              value={brightness}
              onChange={setBrightness}
              onActiveChange={setSliding}
              idleFill={sliderInk}
              idleEmpty={sliderEmpty}
              activeFill={isDark ? "#ffffff" : "#010003"}
              activeEmpty={isDark ? "#6a676c" : "#d9d6d9"}
            />
            <SunIcon kind="large" active={sliding} activeColor={ink} />
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
                    // التحديد حلقة داخلية (inset) فما يتغير مقاس المربع ولا يتحرك محتواه ولا باقي المربعات
                    boxShadow: selected ? `inset 0 0 0 calc(6 * var(--u)) ${ink}` : "none",
                    color: t === "quiet" ? "#adacb4" : tp.text,
                  }}
                  aria-pressed={selected}
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
            style={{ backgroundColor: pillTint, color: ink }}
          >
            <IconGear />
            تخصيص
          </button>
        </div>
      </div>
    </div>
  );
}
