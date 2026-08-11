import { getCategoriesWithCounts } from "@/lib/novels";
import { genres as placeholderGenres } from "@/lib/placeholder-data";

export default async function Sidebar() {
  const realCategories = await getCategoriesWithCounts();

  const items =
    realCategories.length > 0
      ? realCategories.map((c) => ({
          id: c.category,
          label: c.category,
          count: `${c.count} رواية`,
          icon: "📖",
          href: `/category/${encodeURIComponent(c.category)}`,
        }))
      : placeholderGenres.map((g) => ({ ...g, href: "#" }));

  return (
    <aside
      aria-label="تصنيفات الأعمال"
      className="w-full shrink-0 rounded bg-white p-2 border border-ink-300/15 lg:w-64"
    >
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-2">
        {items.map((g) => (
          <li key={g.id}>
            <a
              href={g.href}
              className="flex items-center gap-2 rounded px-2 py-2 text-sm text-ink-700 hover:bg-surface hover:text-brand"
            >
              <span className="text-[15px]" aria-hidden>
                {g.icon}
              </span>
              <span>
                <span className="block leading-tight">{g.label}</span>
                <span className="block text-[11px] leading-tight text-ink-300">
                  {g.count}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
