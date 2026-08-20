export default function MobilePromoStrip() {
  return (
    <section className="mobile-reference-card mobile-reference-promo">
      <span className="mobile-reference-promo-icon" aria-hidden="true" />
      <div className="mobile-reference-promo-copy">
        <strong>اقرأ مجانًا على موقعنا</strong>
        <span>مكتبة كبيرة من الروايات والفصول الجديدة</span>
      </div>
      <a href="/categories" className="mobile-reference-promo-button">ابدأ الآن</a>
    </section>
  );
}
