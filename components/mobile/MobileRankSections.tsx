"use client";

import type { Novel } from "@/lib/novels";
import LaurelIcon from "./LaurelIcon";

export type RankSection = {
  key: string;
  label: string;
  moreHref: string;
  novels: (Novel & { wordCount: number; chapterCount: number })[];
};

function formatWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} مليون حرف`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} ألف حرف`;
  return `${n} حرف`;
}

export default function MobileRankSections({ sections }: { sections: RankSection[] }) {
  if (sections.length === 0) {
    return (
      <p className="mobile-category-empty">لا توجد بيانات كافية لعرض الترتيب بعد.</p>
    );
  }

  const scrollTo = (key: string) => {
    const el = document.getElementById(`rank-${key}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <ul className="mobile-rank-tabbar scroll-thin" role="tablist">
        {sections.map((s) => (
          <li key={s.key} className="shrink-0">
            <button type="button" onClick={() => scrollTo(s.key)}>
              {s.label}
            </button>
          </li>
        ))}
      </ul>

      {sections.map((s) => (
        <section key={s.key} id={`rank-${s.key}`} className="mobile-rank-card">
          <div className="mobile-rank-card-heading">
            <span className="mobile-rank-card-heading-text">
              <LaurelIcon className="h-6 w-4" />
              {s.label}
              <LaurelIcon flip className="h-6 w-4" />
            </span>
          </div>
          <ul className="mobile-rank-list">
            {s.novels.map((n, i) => {
              const rank = i + 1;
              return (
                <li key={n.id}>
                  <a href={`/novel/${n.id}`} className="mobile-rank-item">
                    {n.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.cover_url} alt={n.title} />
                    ) : (
                      <span className="mobile-reference-cover-placeholder" />
                    )}
                    <span
                      className={`mobile-rank-badge ${rank <= 3 ? "is-top" : ""}`}
                    >
                      {rank}
                    </span>
                    <span className="mobile-rank-info">
                      <strong>{n.title}</strong>
                      <span>
                        {n.author || "غير معروف"} · {n.chapterCount} فصل ·{" "}
                        {formatWords(n.wordCount)}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <a href={s.moreHref} className="mobile-rank-more">
            المزيد ‹
          </a>
        </section>
      ))}
    </>
  );
}
