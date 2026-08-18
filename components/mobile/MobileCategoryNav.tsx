import { getCategories } from "@/lib/categories";
import CategoryIcon from "@/components/CategoryIcon";

export default async function MobileCategoryNav() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="التصنيفات"
      className="mt-2 grid grid-cols-4 gap-y-3 bg-white px-2 py-3"
    >
      {categories.slice(0, 8).map((c) => (
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
