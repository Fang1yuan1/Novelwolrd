const items = [
  ["التصنيفات", "/categories"],
  ["الترتيب", "/rankings"],
  ["مجاني", "/categories"],
  ["مكتمل", "/completed"],
  ["المميزون", "/rankings"],
  ["قوائم الكتب", "/categories"],
] as const;

export default function MobileQuickNav() {
  return (
    <nav aria-label="روابط سريعة" className="mobile-reference-card mobile-reference-quicknav">
      {items.map(([label, href]) => (
        <a key={label} href={href} className="mobile-reference-quickitem">
          <span className="mobile-reference-icon-placeholder" aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
