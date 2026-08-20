import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileNovelGrid({
  title,
  novels,
}: {
  title: string;
  novels: Novel[];
}) {
  if (novels.length === 0) return null;

  return (
    <section className="mobile-reference-card mobile-reference-books">
      <div className="mobile-reference-section-heading">
        <h2>{title}</h2>
        <a href="/categories">تبديل ↻</a>
      </div>
      <div className="mobile-reference-book-grid">
        {novels.slice(0, 4).map((n) => {
          const categories = parseCategories(n.category);
          return (
            <a key={n.id} href={`/novel/${n.id}`} className="mobile-reference-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.cover_url} alt={n.title} />
              ) : (
                <span className="mobile-reference-cover-placeholder" />
              )}
              <strong>{n.title}</strong>
              <span>{categories[0] || "رواية • قراءة"}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
