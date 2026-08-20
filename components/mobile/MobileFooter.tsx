export default function MobileFooter() {
  return (
    <nav className="mobile-reference-bottom-nav" aria-label="التنقل السفلي">
      <a href="/">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>مكتبتي</span>
      </a>
      <a href="/">
        <span className="mobile-bottom-placeholder" aria-hidden="true" />
        <span>حسابي</span>
      </a>
    </nav>
  );
}
