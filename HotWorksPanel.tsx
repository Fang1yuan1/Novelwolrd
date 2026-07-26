import { genreGrid, spotlightItems } from "@/lib/placeholder-data";

export default function HotWorksPanel() {
  return (
    <section
      aria-labelledby="hot-works-heading"
      className="flex flex-col gap-4 rounded-md bg-white p-4 shadow-sm lg:flex-row"
    >
      {/* بطاقة مميزة */}
      <div className="flex gap-3 lg:w-72 lg:shrink-0">
        <span className="ph-block h-40 w-28 shrink-0 rounded text-xs">
          الغلاف
        </span>
        <div>
          <h2
            id="hot-works-heading"
            className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-300"
          >
            الأعمال الرائجة
          </h2>
          <p className="mb-2 text-base font-semibold text-ink-900">
            بعد الطلاق، استقررت في الحدود الشمالية الغربية
          </p>
          <p className="mb-2 text-xs text-ink-500">
            دون أن يدرك ذلك في البداية، ينظر إلى الاسم الذي حمله يومًا —
            وهو الآن ليس سوى أسطورة تحت قمم الثلج الشمالية الغربية.
          </p>
          <p className="mb-3 text-xs text-ink-300">80,278 يقرؤونها الآن</p>
          <a
            href="#"
            className="inline-block rounded bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
          >
            عرض التفاصيل
          </a>
        </div>
      </div>

      {/* أعمدة التصنيفات */}
      <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {genreGrid.map((col) => (
          <div key={col.heading}>
            <p className="mb-2 flex items-center gap-1 border-b border-ink-300/20 pb-1 text-xs font-semibold text-ink-900">
              <span aria-hidden>{col.icon}</span> {col.heading}
            </p>
            <ul className="space-y-1.5">
              {col.items.map((item, idx) => (
                <li key={idx} className="line-clamp-1 text-xs">
                  {item ? (
                    <a href="#" className="text-ink-700 hover:text-brand">
                      {item}
                    </a>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* العمود الجانبي للأبرز */}
      <div className="flex gap-3 lg:w-56 lg:shrink-0 lg:flex-col">
        {spotlightItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className="flex flex-1 gap-2 rounded border border-ink-300/20 p-2 hover:border-brand"
          >
            <span className="ph-block h-16 w-12 shrink-0 rounded text-[10px]">
              الغلاف
            </span>
            <span className="min-w-0">
              <span className="mb-1 inline-block rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                {item.label}
              </span>
              <span className="line-clamp-2 block text-xs font-medium text-ink-900">
                {item.title}
              </span>
              <span className="mt-0.5 block text-[10px] text-ink-300">
                {item.stat}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
