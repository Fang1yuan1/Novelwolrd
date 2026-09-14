"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

const MAX_LINES = 3;
// Used only as the very first paint, before the real measurement below runs
// and corrects it — avoids a flash of the full untruncated text.
const FALLBACK_LENGTH = 130;

export default function MobileDescriptionCard({ novel }: { novel: Novel }) {
  const categories = parseCategories(novel.category);
  const tags = (novel.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const description = novel.description || "لا يوجد وصف لهذا العمل بعد.";
  // Flatten manual line breaks for the collapsed preview so wrapping is
  // governed purely by the container width, not the source formatting —
  // otherwise a description with its own short paragraph breaks forces
  // extra visual lines regardless of character count.
  const flattened = description.replace(/\s+/g, " ").trim();

  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(() =>
    flattened.length > FALLBACK_LENGTH
      ? flattened.slice(0, FALLBACK_LENGTH).replace(/\s+\S*$/, "")
      : flattened
  );
  const [isTruncatable, setIsTruncatable] = useState(
    flattened.length > FALLBACK_LENGTH
  );
  const measureRef = useRef<HTMLParagraphElement>(null);

  // Measure against the ACTUAL rendered width/font and binary-search the
  // exact character where 3 lines end. This works for any description
  // regardless of word length, diacritics, or punctuation width — a fixed
  // character budget can never be right for every novel's text.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
    if (!lineHeight) return;
    const maxHeight = lineHeight * MAX_LINES + 1;

    el.textContent = flattened;
    if (el.scrollHeight <= maxHeight) {
      setIsTruncatable(false);
      setTruncated(flattened);
      return;
    }

    let lo = 0;
    let hi = flattened.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi + 1) / 2);
      el.textContent = flattened.slice(0, mid) + "...";
      if (el.scrollHeight <= maxHeight) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    setTruncated(flattened.slice(0, lo).replace(/\s+\S*$/, ""));
    setIsTruncatable(true);
  }, [flattened]);

  const alreadyHasEllipsis = /(\.\.\.|…)$/.test(truncated);

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
      <div className="relative">
        {/* Invisible measuring twin: same width/font/line-height as the
            visible paragraph, used only to find the exact 3-line cut. */}
        <p
          ref={measureRef}
          aria-hidden="true"
          className="invisible absolute right-0 left-0 top-0 -z-10 whitespace-pre-line text-[15px] leading-relaxed"
        />
        <p
          className={`whitespace-pre-line text-[15px] leading-relaxed text-ink-700 ${
            isTruncatable ? "pl-4" : ""
          }`}
        >
          {expanded || !isTruncatable ? description : truncated}
          {!expanded && isTruncatable && !alreadyHasEllipsis && "..."}
        </p>
        {isTruncatable && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="absolute bottom-0 left-0 text-ink-500"
            aria-label={expanded ? "إخفاء" : "المزيد"}
          >
            <Chevron up={expanded} />
          </button>
        )}
      </div>
    </section>
  );
}
