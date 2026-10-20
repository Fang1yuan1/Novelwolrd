import MobileHome from "@/components/mobile/MobileHome";
import PhoneFrame from "@/components/PhoneFrame";

export const revalidate = 3600; // ISR: تُبنى مرة وتتجدد كل ساعة (لتقليل ISR Writes بخطة Vercel المجانية)

export default async function Home() {
  return (
    <PhoneFrame>
      <MobileHome />
    </PhoneFrame>
  );
}
