import { notFound } from "next/navigation";
import { getNovelById } from "@/lib/novels";
import CommunityPage from "@/components/community/CommunityPage";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

export default async function NovelCommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { id } = await params;
  const { chapter: chapterParam } = await searchParams;
  const chapter = chapterParam != null && chapterParam !== "" && Number.isFinite(Number(chapterParam)) ? Number(chapterParam) : null;
  const novel = await getNovelById(id);
  if (!novel) notFound();
  return (
    <PhoneFrame>
      <CommunityPage
        novel={{ id: novel.id, title: novel.title, cover_url: novel.cover_url }}
        chapter={chapter}
      />
    </PhoneFrame>
  );
}
