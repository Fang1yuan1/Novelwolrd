export default function MobilePromoStrip() {
  return (
    <a
      href="/categories"
      className="mt-2 flex items-center gap-3 bg-white px-3 py-3"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-lg text-white">
        📖
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold text-ink-900">
          اقرأ مجانًا بدون تسجيل
        </span>
        <span className="block text-[11px] text-ink-300">
          كل الروايات والفصول متاحة مباشرة من المتصفح
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-white">
        تصفّح الآن
      </span>
    </a>
  );
}
