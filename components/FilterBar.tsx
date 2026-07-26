import { filterGroups } from "@/lib/placeholder-data";

export default function FilterBar() {
  return (
    <section
      aria-label="تنقيح نتائج البحث"
      className="flex flex-col gap-3 rounded-md bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-ink-900">لم تجد ما تبحث عنه؟ جرّب:</span>
        {filterGroups.map((g) => (
          <label key={g.label} className="relative">
            <span className="sr-only">{g.label}</span>
            <select className="appearance-none rounded border border-ink-300/40 bg-white px-3 py-1.5 pe-6 text-ink-700 hover:border-brand">
              <option>{g.label}</option>
              {g.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
        <button
          type="button"
          className="rounded bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
        >
          ابحث بالفلاتر
        </button>
      </div>
      <p className="text-[11px] text-ink-300">
        تركيبة شائعة: خيال ملحمي · مستمرة · 1–2 مليون كلمة
      </p>
    </section>
  );
}
