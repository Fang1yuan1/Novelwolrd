import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getChapterCount, getNovels } from "@/lib/novels";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const novels = await getNovels();
  const counts = await Promise.all(novels.map((n) => getChapterCount(n.id)));
  const ranked = novels
    .map((n, i) => ({ novel: n, chapterCount: counts[i] }))
    .sort((a, b) => b.chapterCount - a.chapterCount);

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navbar />

      <main className="mx-auto max-w-shell px-3 py-4">
        <h1 className="mb-1 text-lg font-bold text-ink-900">الترتيب</h1>
        <p className="mb-3 text-[12px] text-ink-300">
          مرتّبة حسب عدد الفصول المنشورة فعليًا
        </p>

        {ranked.length === 0 ? (
          <p className="rounded border border-ink-300/15 bg-white p-4 text-center text-sm text-ink-300">
            لا توجد روايات بعد.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {ranked.map(({ novel, chapterCount }, i) => (
              <li key={novel.id}>
                <a
                  href={`/novel/${novel.id}`}
                  className="flex items-center gap-3 rounded border border-ink-300/15 bg-white p-2 hover:border-brand/40"
                >
                  <span className="w-7 shrink-0 text-center text-sm font-bold text-ink-300">
                    {i + 1}
                  </span>
                  {novel.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={novel.cover_url}
                      alt={novel.title}
                      className="h-16 w-12 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="ph-block h-16 w-12 shrink-0 rounded text-[9px]">
                      الغلاف
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-[13px] font-semibold text-ink-900">
                      {novel.title}
                    </span>
                    {novel.author && (
                      <span className="line-clamp-1 block text-[11px] text-ink-300">
                        {novel.author}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-300">
                    {chapterCount} فصل
                  </span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </main>

      <Footer />
    </div>
  );
}
