import AdSlot from "./AdSlot";

export default function Header() {
  return (
    <header className="w-full bg-white">
      {/* الشريط العلوي */}
      <div className="border-b border-ink-300/20 bg-white text-xs text-ink-500">
        <div className="mx-auto flex max-w-shell items-center justify-between px-4 py-2">
          <nav className="flex items-center gap-4">
            <span className="font-medium text-ink-700">عالم الروايات</span>
            <span className="text-ink-300">|</span>
            <a href="#" className="hover:text-brand">
              موقع القارئات
            </a>
            <span className="text-ink-300">|</span>
            <a href="#" className="hover:text-brand">
              النسخة التقليدية
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="rounded bg-brand px-3 py-1 font-medium text-white hover:bg-brand-dark"
            >
              تسجيل الدخول
            </a>
            <a href="#" className="hover:text-brand">
              إنشاء حساب
            </a>
          </div>
        </div>
      </div>

      {/* إعلان الشريط العلوي */}
      <div className="mx-auto max-w-shell px-4 py-3">
        <AdSlot label="إعلان الشريط العلوي — 1600×90" height="h-16 sm:h-20" />
      </div>

      {/* الشعار + البحث + الحساب */}
      <div className="mx-auto flex max-w-shell flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="ph-block h-12 w-12 rounded-lg text-lg">📚</div>
          <div>
            <p className="text-2xl font-bold leading-tight text-ink-900">
              عالم<span className="text-brand">الروايات</span>
            </p>
            <p className="text-[11px] tracking-wide text-ink-500">
              مجموعة القراءة · الموقع الرئيسي
            </p>
          </div>
        </div>

        <form className="flex w-full max-w-xl items-stretch overflow-hidden rounded border border-ink-300/50 sm:mx-6">
          <label htmlFor="site-search" className="sr-only">
            ابحث في الفهرس
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="ابحث عن عناوين، مؤلفين، وسوم…"
            className="w-full px-4 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-300"
          />
          <button
            type="submit"
            aria-label="بحث"
            className="flex w-12 items-center justify-center bg-brand text-white hover:bg-brand-dark"
          >
            🔎
          </button>
        </form>

        <a
          href="#"
          className="flex items-center justify-center gap-2 self-start rounded border border-ink-300/50 px-4 py-2 text-sm font-medium text-ink-700 hover:border-brand hover:text-brand sm:self-auto"
        >
          <span aria-hidden>📖</span> مكتبتي
        </a>
      </div>
    </header>
  );
}
