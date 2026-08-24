"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

function pickBatch(novels: Novel[], count: number, excludeIds: number[]): Novel[] {
  const pool = novels.filter((n) => !excludeIds.includes(n.id));
  const source = pool.length >= count ? pool : novels;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function MobileRecommendedForYou({ novels }: { novels: Novel[] }) {
  const [batch, setBatch] = useState<Novel[]>(() => pickBatch(novels, 3, []));

  if (novels.length === 0) return null;

  return (
    <section className="mobile-reference-card px-3 py-3">
      <div className="mobile-reference-section-heading">
        <span className="mobile-reference-heading-group">
          <h2>قد يعجبك</h2>
          <span className="mobile-reference-badge-pill">اقتراحات حسب اهتمامك</span>
        </span>
        <button
          type="button"
          onClick={() => setBatch((prev) => pickBatch(novels, 3, prev.map((n) => n.id)))}
          className="flex items-center gap-1 text-[13px] font-bold text-[#5f94d0]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
          تبديل الدفعة
        </button>
      </div>
      <ul className="flex flex-col gap-4">
        {batch.map((n) => {
          const cats = parseCategories(n.category);
          return (
            <li key={n.id}>
              <a href={`/novel/${n.id}`} className="flex items-start gap-3 text-right">
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[14px] font-bold text-ink-900">
                    {n.title}
                  </span>
                  {n.description && (
                    <span className="line-clamp-2 mt-1 block text-[12px] leading-relaxed text-ink-500">
                      {n.description}
                    </span>
                  )}
                  {cats[0] && (
                    <span className="mt-1.5 inline-block rounded bg-[#f2f2f3] px-1.5 py-0.5 text-[10px] text-[#8a8a8f]">
                      {cats[0]}
                    </span>
                  )}
                </span>
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.cover_url} alt={n.title} className="h-20 w-14 shrink-0 rounded object-cover" />
                ) : (
                  <span className="ph-block h-20 w-14 shrink-0 rounded text-[9px]">الغلاف</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
