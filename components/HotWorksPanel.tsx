import { getNovels } from "@/lib/novels";
import { genreGrid as placeholderGenreGrid, spotlightItems } from "@/lib/placeholder-data";

export default async function HotWorksPanel() {
  const novels = await getNovels();
  const hasReal = novels.length > 0;
  const featured = hasReal ? novels[0] : null;

  // بناء أعمدة تصنيفات حقيقية من الروايات الموجودة فعليًا بالقاعدة
  const categoryMap = new Map<string, string[]>();
  for (const n of novels) {
    const cat = n.category?.trim();
    if (!cat) continue;
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(n.title);
  }
  const realGenreGrid = Array.from(categoryMap.entries()).map(([heading, items]) => ({
    heading,
    icon: "📚",
    items: items.slice(0, 4),
  }));

  const genreGrid = realGenreGrid.length > 0 ? realGenreGrid : placeholderGenreGrid;

  return (
    <section
      aria-labelledby="hot-works-heading"
      className="flex flex-col gap-2 rounded bg-white p-2.5 border border-ink-300/15 lg:flex-row"
    >
      {/* بطاقة مميزة */}
      <div className="flex gap-2 lg:w-72 lg:shrink-0">
        <span className="ph-block h-32 w-24 shrink-0 rounded text-[11px]">
          الغلاف
        </span>
        <div>
          <h2
            id="hot-works-heading"
            className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-300"
          >
            الأعمال الرائجة
          </h2>
          <p className="mb-2 text-sm font-semibold text-ink-900">
            {featured ? featured.title : "بعد الطلاق، استقررت في الحدود الشمالية الغربية"}
          </p>
          <p className="mb-2 text-[11px] text-ink-500">
            {featured
              ? featured.description || ""
              : "دون أن يدرك ذلك في البداية، ينظر إلى الاسم الذي حمله يومًا — وهو الآن ليس سوى أسطورة تحت قمم الثلج الشمالية الغربية."}
          </p>
          <a
            href={featured ? `/novel/${featured.id}` : "#"}
            className="inline-block rounded bg-brand px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-dark"
          >
            عرض التفاصيل
          </a>
        </div>
      </div>

      {/* أعمدة التصنيفات */}
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        {genreGrid.map((col) => (
          <div key={col.heading}>
            <p className="mb-2 flex items-center gap-1 border-b border-ink-300/20 pb-1 text-[11px] font-semibold text-ink-900">
              <span aria-hidden>{col.icon}</span> {col.heading}
            </p>
            <ul className="space-y-1.5">
              {col.items.map((item, idx) => (
                <li key={idx} className="line-clamp-1 text-[11px]">
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

      {/* العمود الجانبي للأبرز — بدون مصدر بيانات حقيقي حاليًا (أرقام شعبية) */}
      <div className="flex gap-2 lg:w-56 lg:shrink-0 lg:flex-col">
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
              <span className="line-clamp-2 block text-[11px] font-medium text-ink-900">
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
