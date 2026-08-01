import AdSlot from "./AdSlot";

export default function TripleAdBanner() {
  return (
    <section
      aria-label="صف إعلانات ترويجية"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      <AdSlot label="الإبلاغ عن إساءة / إشعار سلامة" height="h-24" />
      <AdSlot label="إعلان حماية القاصرين" height="h-24" />
      <AdSlot label="إعلان حملة موسمية" height="h-24" />
    </section>
  );
}
