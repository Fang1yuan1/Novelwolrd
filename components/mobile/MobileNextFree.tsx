import type { Novel } from "@/lib/novels";
import MobileCoverRow from "./MobileCoverRow";

// «العرض القادم»: نفس هندسة «مجاني لفترة محدودة» (غلاف، خطوط، مسافات) بدون العدّاد
export default function MobileNextFree({ novels }: { novels: Novel[] }) {
  return <MobileCoverRow title="العرض القادم" novels={novels.slice(0, 6)} />;
}
