import { getCategories } from "@/lib/categories";

export default async function CategoriesSection() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <section
      aria-label="تصنيفات الموقع"
      className="rounded bg-white p-3 border border-ink-300/15"
    >
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2 className="text-[13px] font-bold text-ink-900">التصنيفات</h2>
      </div>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((c) => (
          <li key={c.id}>
            <a
              href={`/category/${encodeURIComponent(c.name)}`}
              className="flex flex-col items-center gap-1 rounded px-2 py-3 text-center hover:bg-surface"
            >
              <span className="text-xl" aria-hidden>
                {c.icon || "📚"}
              </span>
              <span className="line-clamp-1 text-[12px] font-medium text-ink-700">
                {c.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
