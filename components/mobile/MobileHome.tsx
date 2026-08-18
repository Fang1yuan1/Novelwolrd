import MobileHeader from "./MobileHeader";
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
      <MobileCategoryNav />
      <MobileHeroBanner />
      <MobileNovelGrid title="أحدث الإضافات" novels={latest} />
      <MobileUpdatesList />
      <MobileCompletedList />
      <MobileFooter />
    </div>
  );
}
