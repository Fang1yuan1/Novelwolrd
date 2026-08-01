import { limitedFreeBooks } from "@/lib/placeholder-data";

export default function LimitedFreeStrip() {
  return (
    <section
      aria-label="فصول مجانية لوقت محدود"
      className="flex flex-col gap-2 rounded bg-white p-2.5 border border-ink-300/15 sm:flex-row sm:items-center"
    >
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-32 sm:border-e sm:border-ink-300/20 sm:pe-4">
        <span className="text-[11px] font-semibold text-ink-900">
          مجاني لوقت محدود
        </span>
        <span className="text-[10px] text-ink-300">فصول VIP، مجانًا</span>
        <span className="flex items-center gap-1 text-[15px]" aria-hidden>
          🕒
        </span>
        <span className="font-mono text-sm text-brand">--:--:--</span>
        <a href="#" className="text-[11px] text-ink-500 hover:text-brand">
          ادخل المنطقة المجانية ‹
        </a>
      </div>

      <ul className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
        {limitedFreeBooks.map((b) => (
          <li key={b.id} className="flex flex-col items-center gap-1 text-center">
            <a href="#" className="ph-block aspect-[3/4] w-full rounded text-[10px]">
              الغلاف
            </a>
            <a
              href="#"
              className="line-clamp-2 text-[11px] font-medium text-ink-700 hover:text-brand"
            >
              {b.title}
            </a>
            <span className="rounded-full border border-brand px-2 py-0.5 text-[10px] text-brand">
              {b.note}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
