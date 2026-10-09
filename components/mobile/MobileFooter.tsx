export default function MobileFooter() {
  return (
    <nav className="mobile-reference-bottom-nav" aria-label="التنقل السفلي">
      <a href="/">
        <svg className="mobile-bottom-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.6" />
          <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" />
        </svg>
        <span>حسابي</span>
      </a>
      <a href="/community">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mobile-bottom-img" src="/icons/community/compass.png" alt="" aria-hidden="true" />
        <span>مجتمع</span>
      </a>
    </nav>
  );
}
