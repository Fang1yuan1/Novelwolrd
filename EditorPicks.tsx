import NovelCard from "./NovelCard";
import { editorPicks } from "@/lib/placeholder-data";

export default function EditorPicks() {
  const [feature, ...rest] = editorPicks;

  return (
    <section
      aria-labelledby="editor-picks-heading"
      className="rounded-md bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2
          id="editor-picks-heading"
          className="text-base font-bold text-ink-900"
        >
          اختيارات المحرر
        </h2>
        <a href="#" className="text-xs text-ink-500 hover:text-brand">
          المزيد
        </a>
      </div>

      {/* شريط الأغلفة المميزة */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="flex gap-2 overflow-x-auto scroll-thin sm:w-1/3">
          {editorPicks.slice(0, 4).map((b) => (
            <span
              key={b.id}
              className="ph-block h-28 w-20 shrink-0 rounded text-[10px]"
            >
              الغلاف
            </span>
          ))}
        </div>
        <div className="sm:w-2/3">
          <h3 className="mb-1 text-lg font-bold text-ink-900">
            {feature.title}
          </h3>
          <p className="mb-3 text-sm text-ink-500">{feature.blurb}</p>
          <a
            href="#"
            className="inline-block rounded bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            عرض التفاصيل
          </a>
        </div>
      </div>

      {/* شبكة الاختيارات المتبقية */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {rest.map((b) => (
          <NovelCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}
