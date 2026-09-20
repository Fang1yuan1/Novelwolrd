"use client";

import { useEffect, useState } from "react";
import {
  TocArrowDownIcon,
  TocBackIcon,
  TocDownloadIcon,
  TocPillChevron,
  TocTitleChevron,
} from "./icons/TocIcons";

export type TocRow = {
  id: number;
  number: number;
  title: string | null;
  /** عدد أحرف الفصل */
  words: number;
  /** وقت النشر جاهز كنص (بيتحسب بالسيرفر عشان يتطابق مع المتصفح) */
  stamp: string;
};

export type TocVolume = {
  name: string;
  rows: TocRow[];
};

type TabKey = "toc" | "hot" | "trail" | "marks";

const TABS: { key: TabKey; label: string }[] = [
  { key: "toc", label: "الفهرس" },
  { key: "hot", label: "الأشهر" },
  { key: "trail", label: "السجل" },
  { key: "marks", label: "العلامات" },
];

// صفحة الفهرس (النسخة التقليدية) — مبنية على لقطة مرجع qidian بدقة 828 عرض؛
// كل الأبعاد بوحدة u (= بكسل اللقطة) من كلاسات nw-toc-* بـglobals.css.
export default function MobileTocPage({
  novelId,
  novelTitle,
  volumes,
}: {
  novelId: number;
  novelTitle: string;
  volumes: TocVolume[];
}) {
  const [tab, setTab] = useState<TabKey>("toc");
  const [atBottom, setAtBottom] = useState(false);

  const firstChapter = volumes[0]?.rows[0];
  const hasChapters = Boolean(firstChapter);

  // زر الهيدر بيتحوّل من "إلى النهاية" لـ"إلى البداية" لما توصل آخر الصفحة (زي المرجع)
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 8;
      setAtBottom(
        scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 8
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [tab]);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = `/novel/${novelId}`;
  };

  return (
    <div className="nw-toc" dir="rtl">
      <header className="nw-toc-header">
        <div className="nw-toc-header-inner">
          <button
            type="button"
            onClick={goBack}
            aria-label="رجوع"
            className="nw-toc-back"
          >
            <TocBackIcon className="nw-toc-back-icon" />
          </button>

          <div className="nw-toc-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`nw-toc-tab${tab === t.key ? " is-active" : ""}`}
              >
                {t.label}
                {tab === t.key && <span className="nw-toc-tab-line" />}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={atBottom ? goTop : goBottom}
            className="nw-toc-bottom-btn"
          >
            <TocArrowDownIcon
              className={`nw-toc-bottom-icon${atBottom ? " is-flipped" : ""}`}
            />
            <span>{atBottom ? "للأعلى" : "للأسفل"}</span>
          </button>
        </div>
      </header>

      {tab !== "toc" ? (
        <p className="nw-toc-empty">لا توجد بيانات بعد.</p>
      ) : !hasChapters ? (
        <>
          <section className="nw-toc-band">
            <a href={`/novel/${novelId}`} className="nw-toc-band-title">
              <span>{novelTitle}</span>
              <TocTitleChevron className="nw-toc-band-chevron" />
            </a>
          </section>
          <p className="nw-toc-empty">لم تُرفع فصول لهذا العمل بعد.</p>
        </>
      ) : (
        <>
          {volumes.map((v, vi) => (
            <section key={v.name}>
              {vi === 0 ? (
                <div className="nw-toc-band">
                  <a href={`/novel/${novelId}`} className="nw-toc-band-title">
                    <span>{novelTitle}</span>
                    <TocTitleChevron className="nw-toc-band-chevron" />
                  </a>
                  <p className="nw-toc-volume-name">{v.name}</p>
                </div>
              ) : (
                <div className="nw-toc-volume">
                  <p className="nw-toc-volume-name">{v.name}</p>
                </div>
              )}

              <ul className="nw-toc-list">
                {v.rows.map((row) => (
                  <li key={row.id}>
                    <a
                      href={`/novel/${novelId}/chapter/${row.number}`}
                      className="nw-toc-row"
                    >
                      <span className="nw-toc-row-title">
                        الفصل {row.number}
                        {row.title ? `: ${row.title}` : ""}
                      </span>
                      <span className="nw-toc-row-meta">
                        {row.words} حرف · <bdi dir="ltr">{row.stamp}</bdi>
                      </span>
                      {/* تحميل الفصل منفردًا غير متاح — الأيقونة شكلية بلون المرجع */}
                      <span className="nw-toc-row-dl" aria-hidden="true">
                        <TocDownloadIcon className="nw-toc-dl-icon" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="nw-toc-pill" role="group" aria-label="تنقل سريع">
            <button
              type="button"
              onClick={goTop}
              aria-label="إلى البداية"
              className="nw-toc-pill-btn"
            >
              <TocPillChevron direction="up" className="nw-toc-pill-chevron" />
            </button>
            <button
              type="button"
              onClick={goBottom}
              aria-label="إلى النهاية"
              className="nw-toc-pill-btn"
            >
              <TocPillChevron direction="down" className="nw-toc-pill-chevron" />
            </button>
          </div>

          <div className="nw-toc-bar">
            <button
              type="button"
              disabled
              title="التحميل غير متاح حاليًا"
              className="nw-toc-bar-dl"
            >
              <TocDownloadIcon className="nw-toc-bar-dl-icon" />
              <span>تحميل</span>
            </button>
            <a
              href={`/novel/${novelId}/chapter/${firstChapter!.number}`}
              className="nw-toc-bar-go"
            >
              ابدأ القراءة
            </a>
          </div>
        </>
      )}
    </div>
  );
}
