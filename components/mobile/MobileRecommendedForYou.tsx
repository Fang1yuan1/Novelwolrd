"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/ui/refresh.png" alt="" className="h-[13px] w-[13px]" aria-hidden="true" />
          تبديل الدفعة
        </button>
      </div>
      <ul className="flex flex-col gap-4">
        {batch.map((n) => (
          <li key={n.id}>
            <NovelListItem novel={n} wordCount={n.word_count} />
          </li>
        ))}
      </ul>
    </section>
  );
}
