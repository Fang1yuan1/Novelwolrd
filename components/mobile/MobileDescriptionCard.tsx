"use client";

import { useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileDescriptionCard({ novel }: { novel: Novel }) {
  const categories = parseCategories(novel.category);
  const tags = (novel.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const [expanded, setExpanded] = useState(false);
  const description = novel.description || "لا يوجد وصف لهذا العمل بعد.";
  // Heuristic only used to decide whether to show the toggle at all; the
  // actual truncation to 3 lines is handled by CSS line-clamp so it always
  // matches the real rendered width/font with pixel accuracy.
  const isLong = description.length > 90;

  const Chevron = ({ up }: { up?: boolean }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={up ? "rotate-180" : ""}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <section className="bg-white px-3 py-3">
      {(categories.length > 0 || tags.length > 0) && (
        <div className="mb-2 -mx-3 flex gap-2 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <span
              key={c}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#f2f2f3] px-3 py-1 text-[13px] font-medium text-[#5b5b60]"
            >
              {c}
            </span>
          ))}
          {tags.map((t) => (
            <span
              key={t}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#f2f2f3] px-3 py-1 text-[13px] font-medium text-[#5b5b60]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <p
        className={`whitespace-pre-line text-[15px] leading-relaxed text-ink-700 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {description}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mr-auto mt-1 flex w-fit items-center text-ink-500"
          aria-label={expanded ? "إخفاء" : "المزيد"}
        >
          <Chevron up={expanded} />
        </button>
      )}
    </section>
  );
}
