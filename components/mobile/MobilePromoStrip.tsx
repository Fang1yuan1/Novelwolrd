export default function MobilePromoStrip() {
  return (
    <section className="mobile-reference-card nw-promo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/app-icon.png" alt="" aria-hidden="true" className="nw-promo-icon" />
      <div className="nw-promo-copy">
        <strong>اقرأ مجانًا على موقعنا</strong>
        <span>مكتبة كبيرة من الروايات والفصول الجديدة</span>
      </div>
      <a href="/categories" className="nw-promo-button">سجل الآن</a>
    </section>
  );
}
