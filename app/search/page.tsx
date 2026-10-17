import type { Metadata } from "next";
import { searchNovels } from "@/lib/novels";
import PhoneFrame from "@/components/PhoneFrame";
import MobileGenderHeader from "@/components/mobile/MobileGenderHeader";
import NovelListItem from "@/components/mobile/NovelListItem";

export const metadata: Metadata = {
  title: "بحث",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const results = query ? await searchNovels(query) : [];

  return (
    <PhoneFrame>
      <div className="mobile-reference-page">
        <MobileGenderHeader title="بحث" />
        <div className="mobile-reference-content">
          <form action="/search" method="get" className="mobile-reference-card flex items-center gap-2 px-3 py-2">
            <input
              name="q"
              type="search"
              defaultValue={query}
              autoFocus={!query}
              enterKeyHint="search"
              placeholder="اسم الرواية بالعربية أو الإنجليزية، أو المؤلف"
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink-900 outline-none placeholder:text-[#adadad]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#e5353e] px-4 py-1.5 text-[14px] font-medium text-white"
            >
              بحث
            </button>
          </form>

          {!query ? (
            <p className="mobile-category-empty">اكتب اسم الرواية بالعربية أو الإنجليزية.</p>
          ) : results.length === 0 ? (
            <p className="mobile-category-empty">لا توجد نتائج لـ «{query}».</p>
          ) : (
            <section className="mobile-reference-card px-3 py-3">
              <div className="mobile-reference-section-heading">
                <h2>النتائج ({results.length})</h2>
              </div>
              <ul className="flex flex-col gap-4">
                {results.map((n) => (
                  <li key={n.id}>
                    <NovelListItem novel={n} wordCount={n.word_count} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
