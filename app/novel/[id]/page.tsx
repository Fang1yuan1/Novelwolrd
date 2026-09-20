import {
  getChapterPreview,
  getNovelById,
  getNovelsByAuthor,
  getRelatedNovels,
} from "@/lib/novels";
import { notFound } from "next/navigation";
import TabNav from "@/components/novel/TabNav";
import InfoCard from "@/components/novel/InfoCard";
import AuthorCard from "@/components/novel/AuthorCard";
import AuthorOtherWorksCard from "@/components/novel/AuthorOtherWorksCard";
import DescriptionCard from "@/components/novel/DescriptionCard";
import VotingCard from "@/components/novel/VotingCard";
import BookListsCard from "@/components/novel/BookListsCard";
import ChapterListCard from "@/components/novel/ChapterListCard";
import HonorsCard from "@/components/novel/HonorsCard";
import CopyrightCard from "@/components/novel/CopyrightCard";
import RelatedNovelsCard from "@/components/novel/RelatedNovelsCard";
import AdSlot from "@/components/AdSlot";
import MobileNovelDetail from "@/components/mobile/MobileNovelDetail";

export const dynamic = "force-dynamic";

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const novel = await getNovelById(id);

  if (!novel) {
    notFound();
  }

  const authorName = novel.author?.trim() || "";

  // كل الطلبات مع بعض (مو ورا بعض) وكلها خفيفة: معاينة الفصول (أول فصل + آخر ٣٠ + العدد) بدل القائمة كاملة، وأعمال المؤلف والمشابهة بفلتر بقاعدة البيانات
  const [preview, related, sameAuthor] = await Promise.all([
    getChapterPreview(id),
    getRelatedNovels(novel.category, novel.id, 6),
    authorName ? getNovelsByAuthor(authorName) : Promise.resolve([]),
  ]);

  // معاينة الفصول: أول فصل (لزر «ابدأ القراءة») + آخر الفصول، بدون تكرار
  const chapters =
    preview.first && !preview.recent.some((c) => c.id === preview.first!.id)
      ? [preview.first, ...preview.recent]
      : preview.recent;
  const chapterTotal = preview.total;

  let authorNovels: typeof related = [];
  let authorTotalWords = novel.word_count ?? 0;

  if (authorName) {
    authorNovels = sameAuthor.filter((n) => n.id !== novel.id);

    // إجمالي أحرف كل أعمال المؤلف (يشمل هذه الرواية) — من العمود المحسوب مسبقًا بقاعدة البيانات، مش بجلب كل الفصول
    authorTotalWords =
      (novel.word_count ?? 0) +
      authorNovels.reduce((sum, n) => sum + (n.word_count ?? 0), 0);
  }

  return (
    <>
      {/* النسخة التقليدية — شاشات صغيرة (موبايل) */}
      <div className="sm:hidden">
        <MobileNovelDetail
          novel={novel}
          chapters={chapters}
          chapterTotal={chapterTotal}
          related={related}
        />
      </div>

      {/* النسخة الغنية — شاشات كبيرة (آيباد/لابتوب) */}
      <div className="hidden min-h-screen bg-surface sm:block">
        <main className="mx-auto flex max-w-shell flex-col gap-3 px-3 py-4">
          <nav className="text-[11px] text-ink-500">
            <a href="/" className="hover:text-brand">
              الرئيسية
            </a>
            {novel.category && (
              <>
                <span className="mx-1 text-ink-300">/</span>
                <span>{novel.category}</span>
              </>
            )}
            <span className="mx-1 text-ink-300">/</span>
            <span className="text-ink-700">{novel.title}</span>
          </nav>

          <div className="flex flex-col gap-3 sm:flex-row">
            <TabNav />

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="min-w-0 flex-1">
                  <InfoCard novel={novel} chapters={chapters} chapterTotal={chapterTotal} />
                </div>
                <AuthorCard
                  novel={novel}
                  authorNovelsCount={authorNovels.length + 1}
                  totalWordCount={authorTotalWords}
                />
              </div>

              <DescriptionCard novel={novel} />
              <VotingCard />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AdSlot label="إعلان — 600×120" height="h-20" />
                <AdSlot label="إعلان — 600×120" height="h-20" />
              </div>

              <BookListsCard />

              <ChapterListCard novel={novel} chapters={preview.recent} total={chapterTotal} />
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-48 lg:w-72">
              <HonorsCard />
              <CopyrightCard />
              <AuthorOtherWorksCard novels={authorNovels} authorName={authorName || "الكاتب"} />
              <RelatedNovelsCard novels={related} category={novel.category} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
