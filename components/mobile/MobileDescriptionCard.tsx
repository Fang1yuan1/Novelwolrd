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

  // Character-based truncation (approximates 3 lines on mobile width) instead
  // of relying on CSS line-clamp + an absolutely-positioned overlay, which
  // could visually collide with the underlying text.
  const COLLAPSED_LENGTH = 100;
  const isTruncatable = description.length > COLLAPSED_LENGTH;
  const truncated = isTruncatable
    ? description.slice(0, COLLAPSED_LENGTH).replace(/\s+\S*$/, "")
    : description;

  const Chevron = ({ up }: { up?: boolean }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block align-middle ${up ? "rotate-180" : ""}`}
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
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
        {expanded || !isTruncatable ? (
          <>
            {description}
            {isTruncatable && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="mr-1 inline-flex items-center text-ink-500"
                aria-label="إخفاء"
              >
                <Chevron up />
              </button>
            )}
          </>
        ) : (
          <>
            {truncated}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center text-ink-500"
              aria-label="المزيد"
            >
              ...
              <Chevron />
            </button>
          </>
        )}
      </p>
    </section>
  );
}
