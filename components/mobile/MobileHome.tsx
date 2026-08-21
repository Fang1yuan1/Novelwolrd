import MobileHeader from "./MobileHeader";
import MobileQuickNav from "./MobileQuickNav";
import MobilePromoStrip from "./MobilePromoStrip";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileNovelGrid from "./MobileNovelGrid";
import MobileFooter from "./MobileFooter";
import { getNovels } from "@/lib/novels";

const bottomTiles = [
  ["القصص", "/categories", "/icons/hometiles/stories.png"],
  ["كتب صوتية", "/categories", "/icons/hometiles/audiobooks.png"],
  ["الأكثر قراءة", "/rankings", "/icons/hometiles/most-read.png"],
  ["جديد اليوم", "/categories", "/icons/hometiles/new-today.png"],
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
          {bottomTiles.map(([label, href, icon]) => (
            <a key={label} href={href} className="mobile-reference-small-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" className="mobile-reference-small-icon" aria-hidden="true" />
              <strong>{label}</strong>
            </a>
          ))}
        </section>
      </main>
      <MobileFooter />
    </div>
  );
}
