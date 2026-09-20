import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChapterListCard from "@/components/novel/ChapterListCard";
import MobileTocPage, {
  type TocVolume,
} from "@/components/mobile/MobileTocPage";
import {
  formatChapterStamp,
  getChapterListItems,
  getNovelById,
  groupChaptersByVolume,
} from "@/lib/novels";

export const dynamic = "force-dynamic";

export default async function NovelTocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  // قائمة خفيفة (بدون نص الفصول) — التنسيق كله هنا بالسيرفر وللمتصفح بس نصوص جاهزة
  const chapters = await getChapterListItems(id);
  const volumes: TocVolume[] = groupChaptersByVolume(chapters).map((v) => ({
    name: v.volume,
    rows: v.chapters.map((ch) => ({
      id: ch.id,
      number: ch.chapter_number,
      title: ch.title,
      words: ch.word_count,
      stamp: formatChapterStamp(ch.created_at),
    })),
  }));

  return (
    <>
      {/* النسخة التقليدية — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileTocPage
          novelId={novel.id}
          novelTitle={novel.title}
          volumes={volumes}
        />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب): نفس بطاقة الفهرس اللي بصفحة الرواية */}
      <div className="hidden min-h-screen bg-surface sm:block">
        <Header />
        <Navbar />

        <main className="mx-auto max-w-shell px-3 py-4">
          <nav className="mb-3 text-[11px] text-ink-500">
            <a href="/" className="hover:text-brand">
              الرئيسية
            </a>
            <span className="mx-1 text-ink-300">/</span>
            <a href={`/novel/${novel.id}`} className="hover:text-brand">
              {novel.title}
            </a>
            <span className="mx-1 text-ink-300">/</span>
            <span className="text-ink-700">الفهرس</span>
          </nav>
          <ChapterListCard novel={novel} chapters={chapters} />
        </main>

        <Footer />
      </div>
    </>
  );
}
