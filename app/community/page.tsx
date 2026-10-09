import CommunityPage from "@/components/community/CommunityPage";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

// تبويب «مجتمع» بالشريط السفلي: آخر منشورات كل الممالك
export default function GlobalCommunityPage() {
  return (
    <PhoneFrame>
      <CommunityPage novel={null} />
    </PhoneFrame>
  );
}
