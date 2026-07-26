import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Navbar />

      <main className="mx-auto flex max-w-shell flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Sidebar />
          <div className="flex-1">
            <HeroBanner />
          </div>
        </div>

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
  );
}
