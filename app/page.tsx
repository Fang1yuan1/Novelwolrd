import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import EditorPicks from "@/components/EditorPicks";
import AdSlot from "@/components/AdSlot";
import RankingGrid from "@/components/RankingGrid";
import HotWorksPanel from "@/components/HotWorksPanel";
import NewReleasesSection from "@/components/NewReleasesSection";
import TripleAdBanner from "@/components/TripleAdBanner";
import CompletedWorksSection from "@/components/CompletedWorksSection";
import RecentUpdatesSection from "@/components/RecentUpdatesSection";
import LimitedFreeStrip from "@/components/LimitedFreeStrip";
import FilterBar from "@/components/FilterBar";
import Footer from "@/components/Footer";
import MobileHome from "@/components/mobile/MobileHome";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      {/* النسخة التقليدية — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileHome />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden min-h-screen bg-surface sm:block">
        <Header />
        <Navbar />

        <main className="mx-auto flex max-w-shell flex-col gap-2 px-3 py-2">
          <section aria-label="التصنيفات الرئيسية" className="w-full overflow-hidden rounded bg-white border border-ink-300/15">
            {/* الصورة المخصصة للتصنيفات في أعلى الموقع */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/top-categories.png"
              alt="التصنيفات الرئيسية"
              className="block h-auto w-full object-contain"
            />
          </section>

          <HeroBanner />

          <EditorPicks />

          <AdSlot label="إعلان منتصف الصفحة — 1600×140" height="h-24 sm:h-32" />

          <RankingGrid />

          <AdSlot
            label="إعلان إشعارات المجتمع / السلامة"
            height="h-20 sm:h-28"
          />

          <HotWorksPanel />

          <NewReleasesSection />

          <TripleAdBanner />

          <CompletedWorksSection />

          <RecentUpdatesSection />

          <LimitedFreeStrip />

          <FilterBar />
        </main>

        <Footer />
      </div>
    </>
  );
}
