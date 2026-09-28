"use client";

import { useEffect, useState } from "react";
import { READER_PALETTES, type ReaderTheme } from "@/lib/reader-theme";

// نفس مفتاح التخزين ونفس شكل الإعدادات المستخدمة بصفحة القراءة (MobileChapterReader.tsx) —
// عشان معاينة الفصل هنا تطابق فعليًا ثيم/حجم خط/سطوع القارئ الحقيقيين، مش نسخة منفصلة.
const STORAGE_KEY = "novelwolrd-reader-prefs";
const FONT_MIN = 14;
const FONT_LEVELS = Array.from({ length: 15 }, (_, i) => FONT_MIN + i);

// كم بكسل نصغّر نص المعاينة عن حجم خط صفحة القراءة (غيّر الرقم لو تبي أصغر/أكبر)
const PREVIEW_FONT_OFFSET = 4;

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
  paragraphs,
}: {
  novelId: number | string;
  chapterNumber: number;
  chapterTitle: string | null;
  paragraphs: string[];
}) {
  const [prefs, setPrefs] = useState<Prefs>({ theme: "original", fontLevel: 4, brightness: 100 });
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setPrefs(readSavedPrefs());
    setMounted(true);
  }, []);

  const p = READER_PALETTES[prefs.theme];
  // حجم النص هنا أصغر شوي من حجم القراءة الفعلي بصفحة الفصل (زي المرجع)، لكن لسه بيكبر/يصغر
  // مع تغيير المستخدم لحجم الخط بصفحة القراءة، بدل ما يكون رقم ثابت منفصل عنه تمامًا.
  const readerFontSize = FONT_LEVELS[prefs.fontLevel];
  const fontSize = Math.max(13, readerFontSize - PREVIEW_FONT_OFFSET);
  // المسافة بين سطرين بالمرجع = 32px (مقاسة من الصورة)، ونكبّرها لو الخط كبر
  const lineHeightPx = Math.max(32, fontSize * 2);
  const fadeColor = mounted ? p.pageBg : "#ffffff";

  return (
    <section style={{ backgroundColor: mounted ? p.pageBg : "#ffffff" }} className="relative mt-2 px-3 py-3">
      {/* شريط التبويبات الثلاثة */}
      <div className="mb-[25.5px] flex items-center gap-4">
        <span className="relative text-[15px] font-bold" style={{ color: mounted ? p.text : "#191919" }}>
          فصل تجريبي
          <span
            aria-hidden
            className="absolute -left-2 -top-0.5 h-[6px] w-[2.5px] -rotate-[20deg] rounded-full bg-brand"
          />
        </span>
        <span className="text-[15px]" style={{ color: mounted ? p.mutedText : "#999999" }}>
          مزيد من المحتوى ذي الصلة
        </span>
        <span className="text-[15px]" style={{ color: mounted ? p.mutedText : "#999999" }}>
          توصيات ويب تون
        </span>
      </div>

      {/* سطر النقاش */}
      <div className="mb-[22.5px] flex items-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/flame.png" alt="" aria-hidden className="h-[15px] w-auto shrink-0 opacity-70" />
        <span className="text-[12px]" style={{ color: mounted ? p.mutedText : "#999999" }}>
          نقاش نشط حول هذا الفصل
        </span>
      </div>

      <h3 className="mb-[27.5px] text-[19px] font-bold" style={{ color: mounted ? p.text : "#191919" }}>
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
              // linear-gradient مباشر (مش كلاسات تيلويند) عشان نضمن التعتيم يشتغل فعليًا
              backgroundImage: `linear-gradient(to top, ${fadeColor} 15%, transparent 100%)`,
            }}
          />
        )}
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mx-auto mt-3 flex items-center justify-center gap-1.5 rounded-full border px-10 py-2.5 text-[13px]"
          style={{
            backgroundColor: mounted ? p.chipBg : "#eeeeec",
            borderColor: "rgba(0,0,0,0.3)",
            color: mounted ? p.mutedText : "#666666",
          }}
        >
          متابعة القراءة
          <span aria-hidden className="text-[10px]">
            ⌄
          </span>
        </button>
      )}

      {expanded && (
        <a
          href={`/novel/${novelId}/chapter/${chapterNumber}`}
          className="mt-4 block text-center text-[13px]"
          style={{ color: mounted ? p.chipActiveText : "#e5353e" }}
        >
          فتح صفحة القراءة الكاملة ←
        </a>
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
