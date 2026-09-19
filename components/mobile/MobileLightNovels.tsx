import { getNovels } from "@/lib/novels";
import ScrollRow from "./ScrollRow";

export default async function MobileLightNovels() {
  const all = await getNovels();
  const items = all.slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="nw-books">
      <div className="nw-books-head">
        <div className="nw-books-titlegroup">
          <h2>روايات خفيفة</h2>
        </div>
        <a href="/categories" className="nw-more">
          المزيد ‹
        </a>
      </div>
      <ScrollRow className="nw-free-scroll">
        {items.map((n) => (
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
      </ScrollRow>
    </section>
  );
}
