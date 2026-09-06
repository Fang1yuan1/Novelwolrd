import NovelCard from "./NovelCard";
import { getNovels } from "@/lib/novels";
import { editorPicks as placeholderPicks } from "@/lib/placeholder-data";

export default async function EditorPicks() {
  const novels = await getNovels(6);

  // لو عندنا روايات حقيقية بالقاعدة، نعرضها. لو القاعدة فاضية، نرجع للبيانات الوهمية مؤقتًا.
  const items =
    novels.length > 0
      ? novels.map((n) => ({
          id: String(n.id),
          title: n.title,
          blurb: n.description || "",
          href: `/novel/${n.id}`,
        }))
      : placeholderPicks.map((b) => ({ ...b, href: "#" }));

  const [feature, ...rest] = items;

  return (
    <section
      aria-labelledby="editor-picks-heading"
      className="rounded bg-white p-2.5 border border-ink-300/15"
    >
      <div className="mb-1.5 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2
          id="editor-picks-heading"
          className="text-sm font-bold text-ink-900"
        >
          اختيارات المحرر
        </h2>
        <a href="#" className="text-[11px] text-ink-500 hover:text-brand">
          المزيد
        </a>
      </div>

      {/* شريط الأغلفة المميزة */}
      <div className="mb-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex gap-2 overflow-x-auto scroll-thin sm:w-1/3">
          {items.slice(0, 4).map((b) => (
            <span
              key={b.id}
              className="ph-block h-24 w-16 shrink-0 rounded text-[10px]"
            >
              الغلاف
            </span>
          ))}
        </div>
        <div className="sm:w-2/3">
          <h3 className="mb-1 text-[15px] font-bold text-ink-900">
            {feature.title}
          </h3>
          <p className="mb-1.5 text-sm text-ink-500">{feature.blurb}</p>
          <a
            href={feature.href}
            className="inline-block rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            عرض التفاصيل
          </a>
        </div>
      </div>

      {/* شبكة الاختيارات المتبقية */}
      <div className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
        {rest.map((b) => (
          <NovelCard key={b.id} book={b} href={b.href} />
        ))}
      </div>
    </section>
  );
}
