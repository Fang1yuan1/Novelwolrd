import MobileHeader from "./MobileHeader";
import MobileQuickNav from "./MobileQuickNav";
import MobilePromoStrip from "./MobilePromoStrip";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileNovelGrid from "./MobileNovelGrid";
import MobileFooter from "./MobileFooter";
import MobileBestsellerList from "./MobileBestsellerList";
import MobileLightNovels from "./MobileLightNovels";
import MobileCategoryTabs from "./MobileCategoryTabs";
import MobileFreshList from "./MobileFreshList";
import MobileLimitedFree from "./MobileLimitedFree";
import MobileRankGrid from "./MobileRankGrid";
import MobileCuratedBestsellers from "./MobileCuratedBestsellers";
import MobileRecommendedForYou from "./MobileRecommendedForYou";
import { getNovels, getCategoriesWithCounts } from "@/lib/novels";

const bottomTiles = [
  ["ويب تون", "/categories", "/icons/hometiles/stories.png"],
  ["كتب صوتية", "/categories", "/icons/hometiles/audiobooks.png"],
  ["الأكثر قراءة", "/most-read", "/icons/hometiles/most-read.png"],
  ["جديد اليوم", "/new-today", "/icons/hometiles/new-today.png"],
] as const;

// ترتيب الأقسام: البانر/الأيقونات → الأكثر قراءة → البطاقات الأربعة →
// الأكثر مبيعاً → قد يعجبك → مجاني لفترة محدودة → لوحة الترتيب →
// تصنيفات → جديد سريع الانتشار → مبيعات مختارة → روايات قصيرة
export default async function MobileHome() {
  const latest = await getNovels(8);
  const allNovels = await getNovels();
  const categoriesWithCounts = await getCategoriesWithCounts();
  const categoryNames = categoriesWithCounts.map((c) => c.category).slice(0, 6);

  return (
    <div className="mobile-reference-page">
      <MobileHeader />
      <main className="mobile-reference-content">
        <MobileHeroBanner />
        <MobileQuickNav />
        <MobilePromoStrip />
        <MobileNovelGrid
          title="للداويين"
          badge="قائمة روايات novelwolrd المميزة"
          novels={latest}
        />

        <section className="nw-tiles">
          {bottomTiles.map(([label, href, icon]) => (
            <a key={label} href={href} className="nw-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" className="nw-tile-icon" aria-hidden="true" />
              <strong className="nw-tile-label">{label}</strong>
            </a>
          ))}
        </section>

        <MobileBestsellerList />
        <MobileRecommendedForYou novels={allNovels} />
        <MobileLimitedFree novels={allNovels} />
        <MobileRankGrid />
        <MobileCategoryTabs categories={categoryNames} novels={allNovels} />
        <MobileFreshList />
        <MobileCuratedBestsellers />
        <MobileLightNovels />
      </main>
      <MobileFooter />
    </div>
  );
}
