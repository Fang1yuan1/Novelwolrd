import type { Novel } from "@/lib/novels";
import NovelListItem from "./NovelListItem";

export default function MobileBestsellerList({ novels: completed }: { novels: Novel[] }) {

  if (completed.length === 0) return null;

  

  return (
    <section className="mobile-reference-card nw-section">
      <div className="mobile-reference-section-heading">
        <h2>روايات مميزة</h2>
        <a href="/categories" className="mobile-reference-more-link">المزيد ‹</a>
      </div>
      <ul className="nw-list">
        {completed.map((novel) => (
          <li key={novel.id}>
            <NovelListItem novel={novel} wordCount={novel.word_count} countPlacement="author" />
          </li>
        ))}
      </ul>
    </section>
  );
}
