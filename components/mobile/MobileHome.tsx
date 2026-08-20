import MobileHeader from "./MobileHeader";
import MobileQuickNav from "./MobileQuickNav";
import MobilePromoStrip from "./MobilePromoStrip";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileNovelGrid from "./MobileNovelGrid";
import MobileFooter from "./MobileFooter";
import { getNovels } from "@/lib/novels";

const bottomTiles = [
  ["جديد اليوم", "/categories"],
  ["الأكثر قراءة", "/rankings"],
  ["كتب صوتية", "/categories"],
  ["القصص", "/categories"],
] as const;

export default async function MobileHome() {
  const latest = await getNovels(8);

  return (
    <div className="mobile-reference-page">
      <MobileHeader />
      <main className="mobile-reference-content">
        <MobileHeroBanner />
        <MobileQuickNav />
        <MobilePromoStrip />
        <MobileNovelGrid title="الأكثر قراءة" novels={latest} />

        <section className="mobile-reference-four-tiles">
          {bottomTiles.map(([label, href]) => (
            <a key={label} href={href} className="mobile-reference-small-tile">
              <span className="mobile-reference-small-placeholder" aria-hidden="true" />
              <strong>{label}</strong>
            </a>
          ))}
        </section>
      </main>
      <MobileFooter />
    </div>
  );
}
