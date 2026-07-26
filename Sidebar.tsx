import { genres } from "@/lib/placeholder-data";

export default function Sidebar() {
  return (
    <aside
      aria-label="تصنيفات الأعمال"
      className="w-full shrink-0 rounded-md bg-white p-3 shadow-sm lg:w-64"
    >
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-2">
        {genres.map((g) => (
          <li key={g.id}>
            <a
              href="#"
              className="flex items-center gap-2 rounded px-2 py-2 text-sm text-ink-700 hover:bg-surface hover:text-brand"
            >
              <span className="text-lg" aria-hidden>
                {g.icon}
              </span>
              <span>
                <span className="block leading-tight">{g.label}</span>
                <span className="block text-[11px] leading-tight text-ink-300">
                  {g.count}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
