import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getNovelsByCategory } from "@/lib/novels";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);
  const novels = await getNovelsByCategory(categoryName);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navbar />

      <main className="mx-auto max-w-shell px-3 py-4">
        <h1 className="mb-3 text-lg font-bold text-ink-900">
          تصنيف: {categoryName}
        </h1>

        {novels.length === 0 ? (
          <p className="rounded bg-white p-4 text-center text-sm text-ink-300 border border-ink-300/15">
            لا توجد روايات في هذا التصنيف حاليًا.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {novels.map((n) => (
              <li key={n.id}>
                <a
                  href={`/novel/${n.id}`}
                  className="group flex flex-col gap-2 rounded bg-white p-2 border border-ink-300/15 hover:border-brand/40"
                >
                  {n.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.cover_url}
                      alt={n.title}
                      className="aspect-[3/4] w-full rounded object-cover"
                    />
                  ) : (
                    <span className="ph-block flex aspect-[3/4] w-full items-center justify-center rounded text-[11px]">
                      الغلاف
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="line-clamp-1 block text-[12px] font-semibold text-ink-900 group-hover:text-brand">
                      {n.title}
                    </span>
                    {n.author && (
                      <span className="line-clamp-1 block text-[11px] text-ink-300">
                        {n.author}
                      </span>
                    )}
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
