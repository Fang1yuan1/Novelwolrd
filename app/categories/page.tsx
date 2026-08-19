import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryIcon from "@/components/CategoryIcon";
import { getCategories } from "@/lib/categories";
import { getCategoriesWithCounts } from "@/lib/novels";

export const dynamic = "force-dynamic";

export default async function CategoriesIndexPage() {
  const [categories, counts] = await Promise.all([
    getCategories(),
    getCategoriesWithCounts(),
  ]);
  const countMap = new Map(counts.map((c) => [c.category, c.count]));

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navbar />

      <main className="mx-auto max-w-shell px-3 py-4">
        <h1 className="mb-3 text-lg font-bold text-ink-900">كل التصنيفات</h1>

        {categories.length === 0 ? (
          <p className="rounded border border-ink-300/15 bg-white p-4 text-center text-sm text-ink-300">
            لا توجد تصنيفات مضافة بعد.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`/category/${encodeURIComponent(c.name)}`}
                  className="flex flex-col items-center gap-2 rounded border border-ink-300/15 bg-white p-3 hover:border-brand/40"
                >
                  <CategoryIcon
                    icon={c.icon}
                    className="text-3xl"
                    imgClassName="h-9 w-9 object-contain"
                  />
                  <span className="text-[13px] font-semibold text-ink-900">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-ink-300">
                    {countMap.get(c.name) || 0} عمل
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
