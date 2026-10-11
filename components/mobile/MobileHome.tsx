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
import { makePicker, shuffle } from "@/lib/home-pool";

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
  const all = await getNovels();
  const categoriesWithCounts = await getCategoriesWithCounts();
  const categoryNames = categoriesWithCounts.map((c) => c.category).slice(0, 6);

  // توزيع بدون تكرار: «للمتدربين» تأخذ أحدث 8، وكل قسم بعدها يأخذ روايات لم تظهر قبله
  const latest = all.slice(0, 8);
  const picker = makePicker(shuffle(all));
  picker.mark(latest);
  const bestsellers = picker.take(3, (n) => n.status === "completed");
  const recommendedBase = picker.take(3);
  const limited = picker.take(6);
  const fresh = picker.take(3, (n) => n.status !== "completed");
  const curated = picker.take(3);
  const light = picker.take(8);
  // «قد يعجبك»: أول 3 معروضة، والباقي لزر التبديل (الروايات غير المستخدمة أولًا)
  const recommendedPool = [...recommendedBase, ...picker.leftoverFirst().filter((n) => !recommendedBase.includes(n))];
  const categoryPool = picker.leftoverFirst();

  return (
    <div className="mobile-reference-page">
      <MobileHeader />
      <main className="mobile-reference-content">
        <MobileHeroBanner />
        <MobileQuickNav />
        <MobilePromoStrip />
        <MobileNovelGrid
          title="للمتدربين"
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

        <MobileBestsellerList novels={bestsellers} />
        <MobileRecommendedForYou novels={recommendedPool} />
        <MobileLimitedFree novels={limited} />
        <MobileRankGrid />
        <MobileCategoryTabs categories={categoryNames} novels={categoryPool} />
        <MobileFreshList novels={fresh} />
        <MobileCuratedBestsellers novels={curated} />
        <MobileLightNovels novels={light} />
      </main>
      <MobileFooter />
    </div>
  );
}
