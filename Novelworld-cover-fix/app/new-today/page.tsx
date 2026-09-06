import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getNovels } from "@/lib/novels";
import MobileNewTodayPage from "@/components/mobile/MobileNewTodayPage";

export const dynamic = "force-dynamic";

export default async function NewTodayPage() {
  const novels = [...(await getNovels())]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 17);

  return (
    <>
      {/* النسخة التقليدية — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileNewTodayPage />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden min-h-screen bg-surface sm:block">
        <Header />
        <Navbar />

        <main className="mx-auto max-w-shell px-3 py-4">
          <h1 className="mb-3 text-lg font-bold text-ink-900">جديد اليوم</h1>

          {novels.length === 0 ? (
            <p className="rounded border border-ink-300/15 bg-white p-4 text-center text-sm text-ink-300">
              لا توجد أعمال مضافة حاليًا.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {novels.map((n) => (
                <li key={n.id}>
                  <a
                    href={`/novel/${n.id}`}
                    className="group flex flex-col gap-2 rounded border border-ink-300/15 bg-white p-2 hover:border-brand/40"
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
                    <span className="line-clamp-2 text-[13px] font-medium text-ink-900 group-hover:text-brand">
                      {n.title}
                    </span>
                  </a>
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
