import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileNovelGrid({
  title,
  badge,
  novels,
  count = 4,
  moreHref = "/categories",
}: {
  title: string;
  /** الشريحة الرمادية بجانب العنوان (مثل 起点优质书单 في المرجع) */
  badge?: string;
  novels: Novel[];
  count?: number;
  moreHref?: string;
}) {
  if (novels.length === 0) return null;

  // نكمّل صفوف الشبكة بالكامل (4 لكل صف) — لو العدد المتاح مايسمحش بصف كامل تاني
  // بنقص العرض لأقرب صف مكتمل بدل ما نسيب فراغ كبير في نص الصفحة زي المرجع بالظبط
  const available = Math.min(count, novels.length);
  const fullRows = Math.floor(available / 4);
  const showCount = fullRows > 0 ? fullRows * 4 : available;
  const shown = novels.slice(0, showCount);

  return (
    <section className="nw-books">
      <div className="nw-books-head">
        <div className="nw-books-titlegroup">
          <h2>{title}</h2>
          {badge && <span className="nw-books-badge">{badge}</span>}
        </div>
        <a href={moreHref} className="nw-books-refresh">
          تبديل
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/ui/refresh.png" alt="" aria-hidden="true" />
        </a>
      </div>
      <div className="nw-books-grid">
        {shown.map((n) => {
          const categories = parseCategories(n.category);
          return (
            <a key={n.id} href={`/novel/${n.id}`} className="nw-book">
              {n.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="nw-book-cover" src={n.cover_url} alt={n.title} />
              ) : (
                <span className="nw-book-cover" />
              )}
              <strong className="nw-book-title">{n.title}</strong>
              <span className="nw-book-cat">
                {categories.length > 0
                  ? categories.slice(0, 2).join(" · ")
                  : "رواية · قراءة"}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
