export default function MobileHeader() {
  return (
    <header className="mobile-reference-header">
      <a href="/" className="mobile-reference-logo" aria-label="الرئيسية">
        عالم الروايات
      </a>

      <div className="mobile-reference-switch" aria-label="نوع الروايات">
        <button className="is-active" type="button">روايات</button>
        <button type="button">كتب</button>
      </div>

      <button className="mobile-app-button" type="button">تسجيل الدخول</button>

      <a className="mobile-search-icon" href="/search" aria-label="بحث">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      </a>

      {/* display:contents عشان الفورم ما يكسر الـ grid-column: 1/-1 اللي على .mobile-reference-search */}
      <form action="/search" method="GET" style={{ display: "contents" }}>
        <label className="mobile-reference-search" htmlFor="mobile-site-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            id="mobile-site-search"
            name="q"
            type="search"
            placeholder="ابحث عن عنوان أو مؤلف"
          />
        </label>
      </form>
    </header>
  );
}
