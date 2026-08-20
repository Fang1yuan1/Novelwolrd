export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-300/10 bg-white px-3 py-2.5">
      <a href="/" className="flex shrink-0 items-center gap-1.5">
        <span className="flex h-8 w-8 items-center justify-center rounded bg-brand text-sm text-white">
          📚
        </span>
        <span className="text-base font-bold text-ink-900">
          نوفل<span className="text-brand">هَب</span>
        </span>
      </a>

      <label
        htmlFor="mobile-site-search"
        className="mx-2 flex flex-1 items-center gap-1.5 rounded-full bg-surface px-3 py-1.5"
      >
        <span aria-hidden className="text-[13px] text-ink-300">
          🔎
        </span>
        <input
          id="mobile-site-search"
          type="search"
          placeholder="ابحث عن عناوين، مؤلفين…"
          className="w-full bg-transparent text-[12px] text-ink-900 outline-none placeholder:text-ink-300"
        />
      </label>
    </header>
  );
}
