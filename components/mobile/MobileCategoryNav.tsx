import { getCategories } from "@/lib/categories";
import CategoryIcon from "@/components/CategoryIcon";

export default async function MobileCategoryNav({
  start = 0,
  count = 6,
  columns = 6,
}: {
  start?: number;
  count?: number;
  columns?: number;
}) {
  const all = await getCategories();
  const categories = all.slice(start, start + count);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="التصنيفات"
      className="mt-2 grid gap-y-3 bg-white px-2 py-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {categories.map((c) => (
        <a
          key={c.id}
          href={`/category/${encodeURIComponent(c.name)}`}
          className="flex flex-col items-center gap-1"
        >
          <CategoryIcon
            icon={c.icon}
            className="text-2xl"
            imgClassName="h-7 w-7 object-contain"
          />
          <span className="line-clamp-1 text-[11px] text-ink-700">
            {c.name}
          </span>
        </a>
      ))}
    </nav>
  );
}
