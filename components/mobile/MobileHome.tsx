import MobileHeader from "./MobileHeader";
import MobileQuickNav from "./MobileQuickNav";
import MobilePromoStrip from "./MobilePromoStrip";
import MobileCategoryNav from "./MobileCategoryNav";
import MobileHeroBanner from "./MobileHeroBanner";
import MobileNovelGrid from "./MobileNovelGrid";
import MobileUpdatesList from "./MobileUpdatesList";
import MobileCompletedList from "./MobileCompletedList";
import MobileFooter from "./MobileFooter";
import { getNovels } from "@/lib/novels";

export default async function MobileHome() {
  const latest = await getNovels(8);

  return (
    <div className="min-h-screen bg-surface">
      <MobileHeader />
      <MobileHeroBanner />
      <MobileQuickNav />
      <MobilePromoStrip />
      <MobileNovelGrid title="أحدث الإضافات" novels={latest} />
      <MobileCategoryNav start={0} count={12} columns={4} />
      <MobileUpdatesList />
      <MobileCompletedList />
      <MobileFooter />
    </div>
  );
}
