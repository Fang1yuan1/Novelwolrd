"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";
import type { TrialReadSettings } from "@/lib/trial-read-settings";

// نفس مفتاح التخزين ونفس شكل الإعدادات المستخدمة بصفحة القراءة (MobileChapterReader.tsx) —
// عشان معاينة الفصل هنا تطابق فعليًا ثيم/حجم خط/سطوع القارئ الحقيقيين، مش نسخة منفصلة.
const STORAGE_KEY = "novelwolrd-reader-prefs";
const FONT_MIN = 14;
const FONT_LEVELS = Array.from({ length: 15 }, (_, i) => FONT_MIN + i);

type Prefs = { theme: ReaderTheme; fontLevel: number; brightness: number };

function readSavedPrefs(): Prefs {
  const fallback: Prefs = { theme: "original", fontLevel: 4, brightness: 100 };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw);
    return {
      theme: saved.theme && saved.theme in READER_PALETTES ? saved.theme : fallback.theme,
      fontLevel:
        typeof saved.fontLevel === "number"
          ? Math.min(FONT_LEVELS.length - 1, Math.max(0, saved.fontLevel))
          : fallback.fontLevel,
      brightness: typeof saved.brightness === "number" ? saved.brightness : fallback.brightness,
    };
  } catch {
    return fallback;
  }
}

export default function MobileChapterTrialReadClient({
  novelId,
  chapterNumber,
  chapterTitle,
  nextNumber,
  paragraphs,
  settings,
}: {
  novelId: number | string;
  chapterNumber: number;
  chapterTitle: string | null;
  nextNumber: number | null;
  paragraphs: string[];
  settings: TrialReadSettings;
}) {
  const [prefs, setPrefs] = useState<Prefs>({ theme: "original", fontLevel: 4, brightness: 100 });
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // نقرأ حجم الخط والسطوع من إعدادات القارئ الحقيقية، لكن الثيم (فاتح/ليلي) نثبته دايمًا
    // على "original" هنا — معاينة صفحة تفاصيل الرواية ما تتبع الوضع الليلي لصفحة القراءة
    const saved = readSavedPrefs();
    setPrefs({ ...saved, theme: "original" });
    setMounted(true);
  }, []);

  const p = READER_PALETTES[prefs.theme];
  // حجم النص هنا أصغر شوي من حجم القراءة الفعلي بصفحة الفصل (زي المرجع)، لكن لسه بيكبر/يصغر
  // مع تغيير المستخدم لحجم الخط بصفحة القراءة، بدل ما يكون رقم ثابت منفصل عنه تمامًا.
  const readerFontSize = FONT_LEVELS[prefs.fontLevel];
  // الفرق (bodyOffset) يتعدّل من /admin/trial-read
  const fontSize = Math.max(11, readerFontSize - settings.bodyOffset);
  // المسافة بين سطرين بالمرجع = 32px (مقاسة من الصورة)، ونكبّرها لو الخط كبر
  const lineHeightPx = Math.max(32, fontSize * 2);
  const fadeColor = mounted ? p.pageBg : "#ffffff";

  return (
    <section style={{ backgroundColor: mounted ? p.pageBg : "#ffffff" }} className="relative mt-2 px-3 py-3">
      {/* شريط التبويبات الثلاثة */}
      {(settings.tab1 || settings.tab2 || settings.tab3) && (
        <div className="mb-[25.5px] flex items-center gap-4">
          {settings.tab1 && (
            <span
              className="relative font-bold"
              style={{ fontSize: settings.tabsSize, color: mounted ? p.text : "#191919" }}
            >
              {settings.tab1}
              <span
                aria-hidden
                className="absolute -left-2 -top-0.5 h-[6px] w-[2.5px] -rotate-[20deg] rounded-full bg-brand"
              />
            </span>
          )}
          {settings.tab2 && (
            <span style={{ fontSize: settings.tabsSize, color: mounted ? p.mutedText : "#999999" }}>
              {settings.tab2}
            </span>
          )}
          {settings.tab3 && (
            <span style={{ fontSize: settings.tabsSize, color: mounted ? p.mutedText : "#999999" }}>
              {settings.tab3}
            </span>
          )}
        </div>
      )}

      {/* سطر النقاش */}
      {settings.discussion && (
        <div className="mb-[22.5px] flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/flame.png" alt="" aria-hidden className="h-[15px] w-auto shrink-0 opacity-70" />
          <span style={{ fontSize: settings.discussionSize, color: mounted ? p.mutedText : "#999999" }}>
            {settings.discussion}
          </span>
        </div>
      )}

      <h3
        className="mb-[27.5px] font-bold"
        style={{ fontSize: settings.titleSize, color: mounted ? p.text : "#191919" }}
      >
        الفصل {chapterNumber}
        {chapterTitle ? ` — ${chapterTitle}` : ""}
      </h3>

      <div className={`relative ${expanded ? "" : "max-h-64 overflow-hidden"}`}>
        <div
          className="flex flex-col gap-[14px] text-center"
          style={{
            fontSize,
            fontWeight: p.boldText ? 700 : 400,
            color: mounted ? p.text : "#191919",
            lineHeight: `${lineHeightPx}px`,
          }}
        >
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {!expanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{
              // تدرّج متصل بدون "وقفة" عند البداية (بدون stop عند 15%) — عشان ما تظهر طبقة بيضاء
              // صلبة فجأة فوق الزر، زي ما كان يحصل، وبدل كده يكون تلاشي تدريجي ناعم من تحت لفوق.
              backgroundImage: `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`,
            }}
          />
        )}
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mx-auto mt-3 flex items-center justify-center gap-2 rounded-full px-9 py-2 text-[13px]"
          style={{
            color: mounted ? p.mutedText : "#666666",
            backgroundColor: mounted ? p.pageBg : "#ffffff",
            border: `1px solid ${mounted ? p.cardBorder : "rgba(25,25,25,0.14)"}`,
          }}
        >
          متابعة القراءة
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 13,
              height: 8,
              backgroundColor: mounted ? p.mutedText : "#666666",
              WebkitMaskImage: "url(/icons/trial-chevron.png)",
              maskImage: "url(/icons/trial-chevron.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </button>
      )}

      {/* نهاية الفصل — مقاسة من لقطة المرجع: زران بعرض متساوٍ (الفصل التالي + فتح القراءة الكاملة) وسطر حقوق */}
      {expanded && (
        <div className="mt-7">
          <div className="flex gap-2">
            {nextNumber != null && (
              <a
                href={`/novel/${novelId}/chapter/${nextNumber}`}
                className="flex h-12 flex-1 items-center justify-center rounded-full text-[16px] font-bold"
                style={{ backgroundColor: "#ffe6e7", color: "#e5353e" }}
              >
                الفصل التالي
              </a>
            )}
            <a
              href={`/novel/${novelId}/chapter/${chapterNumber}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-white"
              style={{ backgroundColor: "#e5353e" }}
            >
              <span className="flex flex-col items-center leading-[1.25]">
                <span className="text-[15px] font-bold">فتح القراءة الكاملة</span>
                <span className="text-[11px]" style={{ opacity: 0.9 }}>
                  بقية الفصول متاحة مجانًا
                </span>
              </span>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="shrink-0">
                <path d="M7 1 1 7l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <p className="mt-[30px] text-center text-[12.5px] leading-[19px]" style={{ color: "#999999" }}>
            تُقدَّم هذه الترجمة على عالم الروايات
            <br />
            <span style={{ color: "#cccccc" }}>حقوق العمل الأصلي محفوظة لأصحابها</span>
          </p>
        </div>
      )}

      {/* تعتيم السطوع — نفس تقنية صفحة القراءة (brightness) */}
      {mounted && prefs.brightness < 100 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: "#000",
            opacity: 0.55 * Math.pow((100 - prefs.brightness) / 100, 1.6),
          }}
        />
      )}
    </section>
  );
}
