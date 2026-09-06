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

  return (
    <section className="bg-white px-3 py-3">
      <h2 className="mb-2 text-[17px] font-bold text-ink-900">نبذة</h2>
      {(categories.length > 0 || tags.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-[#f2f2f3] px-3 py-1 text-[13px] font-medium text-[#5b5b60]"
            >
              {c}
            </span>
          ))}
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#f2f2f3] px-3 py-1 text-[13px] font-medium text-[#5b5b60]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <p
          className={`whitespace-pre-line text-[15px] leading-relaxed text-ink-700 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {description}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-0.5 text-[13px] font-medium text-ink-500"
        >
          {expanded ? "إخفاء" : "المزيد"}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={expanded ? "rotate-180" : ""}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
