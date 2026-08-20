export default function MobileFooter() {
  return (
    <nav className="mobile-reference-bottom-nav" aria-label="التنقل السفلي">
      <a href="/">
        <svg className="mobile-bottom-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4.5" width="16" height="6" rx="3" />
          <rect x="4" y="13.5" width="16" height="6" rx="3" />
        </svg>
        <span>مكتبتي</span>
      </a>
      <a href="/">
        <svg className="mobile-bottom-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" />
        </svg>
        <span>حسابي</span>
      </a>
    </nav>
  );
}
