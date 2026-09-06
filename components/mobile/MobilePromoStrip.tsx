export default function MobilePromoStrip() {
  return (
    <section className="mobile-reference-card mobile-reference-promo">
      <span className="mobile-reference-promo-icon" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="h-full w-full object-cover" />
      </span>
      <div className="mobile-reference-promo-copy">
        <strong>اقرأ مجانًا على موقعنا</strong>
        <span>مكتبة كبيرة من الروايات والفصول الجديدة</span>
      </div>
      <a href="/categories" className="mobile-reference-promo-button">ابدأ الآن</a>
    </section>
  );
}
