import { notFound } from "next/navigation";
import { getNovelById } from "@/lib/novels";
import CommunityPage from "@/components/community/CommunityPage";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

export default async function NovelCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const novel = await getNovelById(id);
  if (!novel) notFound();
  return (
    <PhoneFrame>
      <CommunityPage novel={{ id: novel.id, title: novel.title, cover_url: novel.cover_url }} />
    </PhoneFrame>
  );
}
