import { getNovels } from "@/lib/novels";

export default async function MobileHeroBanner() {
  const novels = await getNovels(5);
  const slide = novels.find((n) => n.cover_url);

  return (
    <section className="mobile-reference-hero-wrap">
      <a
        href={slide ? `/novel/${slide.id}` : "/"}
        className="mobile-reference-hero"
      >
        {slide?.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.cover_url} alt="" />
        ) : (
          <span className="mobile-reference-large-placeholder" />
        )}
        <span className="mobile-reference-hero-shade" />
        <span className="mobile-reference-hero-title">اختيارات مميزة للقراءة</span>
      </a>
      <div className="mobile-reference-dots" aria-hidden="true">
        <span className="active" /><span /><span /><span />
      </div>
    </section>
  );
}
