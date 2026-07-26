import { primaryNav } from "@/lib/placeholder-data";

export default function Navbar() {
  return (
    <nav className="w-full bg-ink-900 text-sm text-white/90">
      <div className="mx-auto flex max-w-shell items-center gap-1 overflow-x-auto px-4 scroll-thin">
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 px-4 py-3 font-medium hover:bg-white/10"
        >
          <span aria-hidden>≡</span> كل التصنيفات
        </button>
        {primaryNav.map((item, i) => (
          <a
            key={item}
            href="#"
            className={`shrink-0 px-4 py-3 hover:bg-white/10 hover:text-white ${
              i === 0 ? "text-brand-light" : ""
            }`}
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
