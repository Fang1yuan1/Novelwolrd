import { notFound } from "next/navigation";
import PostDetail from "@/components/community/PostDetail";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = await params;
  const novelId = Number(id);
  const pid = Number(postId);
  if (!Number.isFinite(novelId) || !Number.isFinite(pid)) notFound();
  return (
    <PhoneFrame>
      <PostDetail novelId={novelId} postId={pid} />
    </PhoneFrame>
  );
}
