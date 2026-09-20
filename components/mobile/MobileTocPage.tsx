"use client";

import { useEffect, useRef, useState } from "react";
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
  const [volName, setVolName] = useState(volumes[0]?.name ?? "");
  const bandRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const firstChapter = volumes[0]?.rows[0];
  const hasChapters = Boolean(firstChapter);

  // زر الهيدر ثابت («للأسفل» + سهم لأسفل) ويتبدّل إلى «للأعلى» (سهم لأعلى) فقط عند الوصول لآخر القائمة
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setAtBottom(max > 8 && window.scrollY >= max - 24);
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

  // الكبسولة العائمة (زي المرجع): مؤشر تمرير — بتنزل وتطلع مع موضع القائمة من أول الفصول لآخرها،
  // وبتغمق وقت الحركة، وبتظهر عند فتح الصفحة وأثناء التمرير وبتختفي بعد لحظات من التوقف.
  // وتقدر تسحبها بإصبعك لتحرّك القائمة بسرعة.
  useEffect(() => {
    const pill = pillRef.current;
    const bar = barRef.current;
    if (!pill || !bar) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let calmTimer: ReturnType<typeof setTimeout> | undefined;
    let dragging = false;
    let grabY = 0;
    let grabOffset = 0;

    const range = () => {
      const minTop = parseFloat(getComputedStyle(pill).top) || 0;
      const maxTop = bar.getBoundingClientRect().top - pill.offsetHeight;
      return Math.max(0, maxTop - minTop);
    };
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const place = () => {
      const max = maxScroll();
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const offset = progress * range();
      pill.style.transform = `translateY(${offset}px)`;
      return offset;
    };
    const show = () => {
      pill.classList.add("is-visible");
      clearTimeout(hideTimer);
      if (!dragging) {
        hideTimer = setTimeout(() => pill.classList.remove("is-visible"), 1300);
      }
    };
    const onScroll = () => {
      place();
      pill.classList.add("is-active");
      show();
      clearTimeout(calmTimer);
      calmTimer = setTimeout(() => {
        if (!dragging) pill.classList.remove("is-active");
      }, 160);
    };
    const onResize = () => place();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      grabY = e.clientY;
      grabOffset = place();
      pill.setPointerCapture(e.pointerId);
      pill.classList.add("is-active", "is-visible");
      clearTimeout(hideTimer);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const r = range();
      if (r <= 0) return;
      const offset = Math.min(r, Math.max(0, grabOffset + (e.clientY - grabY)));
      window.scrollTo(0, (offset / r) * maxScroll());
      pill.style.transform = `translateY(${offset}px)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      pill.classList.remove("is-active");
      show();
    };

    place();
    show(); // تظهر لحظات عند فتح الصفحة زي المرجع
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    pill.addEventListener("pointerdown", onDown);
    pill.addEventListener("pointermove", onMove);
    pill.addEventListener("pointerup", onUp);
    pill.addEventListener("pointercancel", onUp);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(calmTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      pill.removeEventListener("pointerdown", onDown);
      pill.removeEventListener("pointermove", onMove);
      pill.removeEventListener("pointerup", onUp);
      pill.removeEventListener("pointercancel", onUp);
    };
  }, [tab, hasChapters]);

  // الشريط الرمادي مثبّت تحت الهيدر (زي المرجع) واسم المجلد اللي فيه بيتبدّل حسب المجلد اللي عند حافته السفلية
  useEffect(() => {
    const band = bandRef.current;
    const body = bodyRef.current;
    if (!band || !body || volumes.length < 2) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const edge = band.getBoundingClientRect().bottom;
      const sections = body.querySelectorAll<HTMLElement>("[data-vol]");
      let current = 0;
      sections.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= edge + 1) current = i;
      });
      setVolName(volumes[current].name);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tab, hasChapters, volumes]);

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
          <div ref={bandRef} className="nw-toc-band">
            <a href={`/novel/${novelId}`} className="nw-toc-band-title">
              <span>{novelTitle}</span>
              <TocTitleChevron className="nw-toc-band-chevron" />
            </a>
            <p className="nw-toc-volume-name">{volName}</p>
          </div>

          <div ref={bodyRef} className="nw-toc-body">
            {volumes.map((v, vi) => (
              <section key={v.name} data-vol={vi}>
                {vi > 0 && (
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
                          {row.words} حرف · <bdi>{row.stamp}</bdi>
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
          </div>

          <div ref={pillRef} className="nw-toc-pill" aria-hidden="true">
            <span className="nw-toc-pill-btn">
              <TocPillChevron direction="up" className="nw-toc-pill-chevron" />
            </span>
            <span className="nw-toc-pill-btn">
              <TocPillChevron direction="down" className="nw-toc-pill-chevron" />
            </span>
          </div>

          <div ref={barRef} className="nw-toc-bar">
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
