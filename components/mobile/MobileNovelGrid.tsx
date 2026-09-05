import type { Novel } from "@/lib/novels";
import { parseCategories } from "@/lib/novels";

export default function MobileNovelGrid({
  title,
  novels,
  count = 4,
  moreHref = "/categories",
  bare = false,
}: {
  title: string;
  novels: Novel[];
  count?: number;
  moreHref?: string;
  /** لو true: من غير كارت أبيض مستقل حواليه (يبقى مسؤولية الحاوية اللي بتستدعيه) */
  bare?: boolean;
}) {
  if (novels.length === 0) return null;

  // نكمّل صفوف الشبكة بالكامل (4 لكل صف) — لو العدد المتاح مايسمحش بصف كامل تاني
  // بنقص العرض لأقرب صف مكتمل بدل ما نسيب فراغ كبير في نص الصفحة زي المرجع بالظبط
  const available = Math.min(count, novels.length);
  const fullRows = Math.floor(available / 4);
  const showCount = fullRows > 0 ? fullRows * 4 : available;
  const shown = novels.slice(0, showCount);

  const content = (
    <>
      <div className="mobile-reference-section-heading">
        <h2>{title}</h2>
        <a href={moreHref}>تبديل ↻</a>
      </div>
      <div className="mobile-reference-book-grid">
        {shown.map((n) => {
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
              <span>
                {categories.length > 0
                  ? categories.slice(0, 2).join(" · ")
                  : "رواية · قراءة"}
              </span>
            </a>
          );
        })}
      </div>
    </>
  );

  if (bare) {
    return <div className="mobile-reference-books">{content}</div>;
  }
  return <section className="mobile-reference-card mobile-reference-books">{content}</section>;
}
