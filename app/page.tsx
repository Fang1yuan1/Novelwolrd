import MobileHome from "@/components/mobile/MobileHome";
import PhoneFrame from "@/components/PhoneFrame";
import { getServerDeviceKind } from "@/lib/device-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  // صفحة الجوال لكل الأجهزة — والتعرف على الجهاز من الـUser-Agent (مو من عرض الشاشة)
  const deviceKind = await getServerDeviceKind();
  return (
    <PhoneFrame deviceKind={deviceKind}>
      <MobileHome />
    </PhoneFrame>
  );
}
