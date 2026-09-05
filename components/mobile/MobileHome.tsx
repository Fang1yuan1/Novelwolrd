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
  ["القصص", "/categories", "/icons/hometiles/stories.png"],
  ["كتب صوتية", "/categories", "/icons/hometiles/audiobooks.png"],
  ["الأكثر قراءة", "/most-read", "/icons/hometiles/most-read.png"],
  ["جديد اليوم", "/new-today", "/icons/hometiles/new-today.png"],
] as const;

// ترتيب الأقسام أدناه يتبع بالضبط تسلسل المرجع الصيني (qidian.com) كما ظهر
// بالصور المرجعية: البانر/الأيقونات → الأكثر قراءة → البطاقات الأربعة →
// الأكثر مبيعاً → روايات قصيرة → تصنيفات → جديد سريع الانتشار →
// لوحة الترتيب (تبويبات) → مبيعات مختارة → قد يعجبك
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

        <MobileBestsellerList />
        <MobileLightNovels />
        <MobileCategoryTabs categories={categoryNames} novels={allNovels} />
        <MobileFreshList />
        <MobileLimitedFree novels={allNovels} />
        <MobileRankGrid />
        <MobileCuratedBestsellers />
        <MobileRecommendedForYou novels={allNovels} />
      </main>
      <MobileFooter />
    </div>
  );
}
