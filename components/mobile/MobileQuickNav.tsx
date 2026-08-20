const items = [
  ["التصنيفات", "/categories", "/icons/quicknav/categories.png"],
  ["الترتيب", "/rankings", "/icons/quicknav/ranking.png"],
  ["مجاني", "/categories", "/icons/quicknav/free.png"],
  ["مكتمل", "/completed", "/icons/quicknav/completed.png"],
  ["المميزون", "/rankings", "/icons/quicknav/top-authors.png"],
  ["قوائم الكتب", "/categories", "/icons/quicknav/booklists.png"],
] as const;

export default function MobileQuickNav() {
  return (
    <nav aria-label="روابط سريعة" className="mobile-reference-card mobile-reference-quicknav">
      {items.map(([label, href, icon]) => (
        <a key={label} href={href} className="mobile-reference-quickitem">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" className="mobile-reference-quickicon" aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
