import { searchNovels, type Novel } from "@/lib/novels";
import MobileGenderHeader from "./MobileGenderHeader";
import NovelListItem from "./NovelListItem";

export default async function MobileSearchPage({ query }: { query: string }) {
  const q = query.trim();
  const results: Novel[] = q ? await searchNovels(q) : [];

  return (
    <div className="mobile-reference-page">
      <MobileGenderHeader title="البحث" />

      <form action="/search" method="GET" className="px-3 pt-3">
        <label htmlFor="search-q" className="sr-only">
          ابحث عن عنوان أو مؤلف
        </label>
        <div className="mobile-reference-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="ابحث عن عنوان أو مؤلف"
            autoFocus
          />
        </div>
      </form>

      <div className="mobile-reference-content">
        {!q ? (
          <p className="mobile-category-empty">اكتب اسم رواية أو مؤلف للبحث.</p>
        ) : results.length === 0 ? (
          <p className="mobile-category-empty">
            ما لقينا نتائج لـ«{q}». جرّب كلمة أخرى أو جزء من الاسم.
          </p>
        ) : (
          <>
            <p className="px-3 pt-3 text-[13px] text-ink-400">
              {results.length} نتيجة لـ«{q}»
            </p>
            <ul className="flex flex-col gap-3 px-3 pb-4 pt-3">
              {results.map((n) => (
                <li key={n.id}>
                  <NovelListItem novel={n} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
