import AdSlot from "./AdSlot";
import { sideHeadlines } from "@/lib/placeholder-data";

export default function HeroBanner() {
  return (
    <section aria-label="محتوى مميز" className="flex flex-col gap-3 lg:flex-row">
      {/* السلايدر الرئيسي */}
      <div className="flex-1">
        <div className="ph-block relative h-64 w-full overflow-hidden rounded-md sm:h-80 lg:h-72">
          <span className="text-sm font-medium">سلايدر رئيسي — 1200×480</span>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-sm">
            <div className="flex gap-3 overflow-hidden">
              <span className="rounded bg-brand px-2 py-0.5 font-medium">
                مميز
              </span>
              <span className="line-clamp-1">
                الموضع 1 · الموضع 2 · الموضع 3 · الموضع 4
              </span>
            </div>
            <div className="flex shrink-0 gap-1" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
            </div>
          </div>
        </div>

        {/* صف البطاقات الترويجية */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PromoTile
            title="حمّل التطبيق"
            subtitle="فترة تجريبية مجانية"
            icon="📱"
          />
          <PromoTile
            title="ابدأ ملحمة جديدة"
            subtitle="اختيارات فريق التحرير"
            icon="🌀"
          />
          <PromoTile
            title="مساحة عمل الكاتب"
            subtitle="أدوات للكتّاب المتسلسلين"
            icon="🖊️"
          />
        </div>
      </div>

      {/* اللوحة الجانبية: عناوين الأخبار + إعلان صغير */}
      <div className="flex w-full flex-col gap-3 lg:w-72">
        <div className="rounded-md bg-white p-3 shadow-sm">
          <p className="mb-2 border-b border-ink-300/20 pb-2 text-sm font-semibold text-ink-900">
            غرفة الأخبار
          </p>
          <ul className="space-y-2 text-xs text-ink-700">
            {sideHeadlines.map((h) => (
              <li key={h} className="line-clamp-1 hover:text-brand">
                <a href="#">{h}</a>
              </li>
            ))}
          </ul>
        </div>
        <AdSlot label="إعلان جانبي ترويجي" height="h-32" />
      </div>
    </section>
  );
}

function PromoTile({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-md bg-white p-3 shadow-sm hover:shadow-md"
    >
      <span className="ph-block h-12 w-12 shrink-0 rounded text-xl" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink-900">
          {title}
        </span>
        <span className="block text-xs text-ink-500">{subtitle}</span>
      </span>
    </a>
  );
}
