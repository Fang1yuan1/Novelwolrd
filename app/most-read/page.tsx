import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getNovels } from "@/lib/novels";
import MobileMostReadPage from "@/components/mobile/MobileMostReadPage";

export const dynamic = "force-dynamic";

export default async function MostReadPage() {
  const novels = [...(await getNovels())]
    .sort((a, b) => (b.chapter_count ?? 0) - (a.chapter_count ?? 0))
    .slice(0, 17);

  return (
    <>
      {/* النسخة التقليدية — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileMostReadPage />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden min-h-screen bg-surface sm:block">
        <Header />
        <Navbar />

        <main className="mx-auto max-w-shell px-3 py-4">
          <h1 className="mb-3 text-lg font-bold text-ink-900">الأكثر قراءة</h1>

          {novels.length === 0 ? (
            <p className="rounded border border-ink-300/15 bg-white p-4 text-center text-sm text-ink-300">
              لا توجد أعمال كافية حاليًا.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {novels.map((n) => (
                <li key={n.id} className="flex gap-3 rounded border border-ink-300/15 bg-white p-3">
                  {n.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.cover_url} alt={n.title} className="h-24 w-16 rounded object-cover" />
                  ) : (
                    <span className="ph-block flex h-24 w-16 items-center justify-center rounded text-[10px]">
                      الغلاف
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <a
                      href={`/novel/${n.id}`}
                      className="block text-sm font-bold text-ink-900 hover:text-brand"
                    >
                      {n.title}
                    </a>
                    {n.description && (
                      <span className="line-clamp-2 mt-1 block text-[12px] text-ink-500">
                        {n.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
