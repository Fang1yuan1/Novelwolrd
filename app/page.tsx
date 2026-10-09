import MobileHome from "@/components/mobile/MobileHome";
import PhoneFrame from "@/components/PhoneFrame";

export const revalidate = 300; // مخزّنة ISR: تُبنى مرة وتُخدم بدون CPU، وتتجدد بالخلفية بعد هذه المدة (ثواني)

export default async function Home() {
  return (
    <PhoneFrame>
      <MobileHome />
    </PhoneFrame>
  );
}
