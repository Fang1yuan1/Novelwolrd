export default function MobileFooter() {
  return (
    <nav className="mobile-reference-bottom-nav" aria-label="التنقل السفلي">
      <a href="/" className="is-active">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>الرئيسية</span>
      </a>
      <a href="/categories">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>التصنيفات</span>
      </a>
      <a href="/rankings">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>الترتيب</span>
      </a>
      <a href="/completed">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>حسابي</span>
      </a>
    </nav>
  );
}
