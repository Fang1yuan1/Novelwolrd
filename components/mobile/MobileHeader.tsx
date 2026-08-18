export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="flex items-center justify-between px-3 py-2.5">
        <a href="/" className="flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-brand text-sm text-white">
            📚
          </span>
          <span className="text-base font-bold text-ink-900">
            نوفل<span className="text-brand">هَب</span>
          </span>
        </a>
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center text-lg text-ink-700"
        >
          🔎
        </span>
      </div>
      <form className="border-t border-ink-300/10 px-3 py-2">
        <label htmlFor="mobile-site-search" className="sr-only">
          ابحث في الفهرس
        </label>
        <input
          id="mobile-site-search"
          type="search"
          placeholder="ابحث عن عناوين، مؤلفين…"
          className="w-full rounded-full bg-surface px-3.5 py-2 text-[13px] text-ink-900 outline-none placeholder:text-ink-300"
        />
      </form>
    </header>
  );
}
