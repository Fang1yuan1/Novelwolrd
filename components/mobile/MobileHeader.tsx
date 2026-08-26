export default function MobileHeader() {
  return (
    <header className="mobile-reference-header">
      <a href="/" className="mobile-reference-logo" aria-label="الرئيسية">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" aria-hidden="true" />
        عالم الروايات
      </a>

      <div className="mobile-reference-switch" aria-label="نوع الروايات">
        <button className="is-active" type="button">روايات</button>
        <button type="button">كتب</button>
      </div>

      <button className="mobile-app-button" type="button">فتح التطبيق</button>

      <button className="mobile-search-icon" type="button" aria-label="بحث">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      </button>

      <label className="mobile-reference-search" htmlFor="mobile-site-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          id="mobile-site-search"
          type="search"
          placeholder="ابحث عن عنوان أو مؤلف"
        />
      </label>
    </header>
  );
}
