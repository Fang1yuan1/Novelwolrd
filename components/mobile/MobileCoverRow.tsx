import type { Novel } from "@/lib/novels";

// صف أغلفة أفقي بنفس هندسة قسم «مجاني لفترة محدودة» بالضبط (نفس الفئات: nw-books / nw-free-scroll / nw-book)،
// يُستعمل بصفحات «مكتمل» و«مجاني» ليكون حجم الغلاف والخطوط والمسافات مطابقًا.
export default function MobileCoverRow({
  title,
  badge,
  moreHref,
  novels,
}: {
  title: string;
  badge?: string;
  moreHref?: string;
  novels: Novel[];
}) {
  if (novels.length === 0) return null;
  return (
    <section className="nw-books">
      <div className="nw-books-head">
        <div className="nw-books-titlegroup">
          <h2 className="nw-free-title">
            <span>{title}</span>
          </h2>
          {badge && <span className="nw-books-badge">{badge}</span>}
        </div>
        {moreHref && (
          <a href={moreHref} className="nw-more">
            المزيد ‹
          </a>
        )}
      </div>
      <ul className="nw-free-scroll">
        {novels.map((n) => (
          <li key={n.id} className="nw-free-item">
            <a href={`/novel/${n.id}`} className="nw-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="nw-book-cover" src={n.cover_url} alt={n.title} />
              ) : (
                <span className="nw-book-cover" />
              )}
              <strong className="nw-book-title">{n.title}</strong>
              <span className="nw-book-author">{n.author || "—"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
