import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileDescriptionCard({ novel }: { novel: Novel }) {
  const categories = parseCategories(novel.category);
  const tags = (novel.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <section className="mt-2 bg-white px-3 py-3">
      <h2 className="mb-2 text-[15px] font-bold text-ink-900">نبذة</h2>
      {(categories.length > 0 || tags.length > 0) && (
        <div className="scroll-thin mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <span
              key={c}
              className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] text-brand"
            >
              {c}
            </span>
          ))}
          {tags.map((t) => (
            <span
              key={t}
              className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] text-ink-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-700">
        {novel.description || "لا يوجد وصف لهذا العمل بعد."}
      </p>
    </section>
  );
}
