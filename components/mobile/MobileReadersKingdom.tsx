// قسم «مملكة القراء» بصفحة تفاصيل الرواية (يقابل 书友圈 بصفحة Qidian).
// حاليًا الشكل الخارجي فقط — نظام التعليقات الفعلي يُربط لاحقًا عبر الخاصية commentsCount والرابط.
export default function MobileReadersKingdom({
  commentsCount = 0,
}: {
  commentsCount?: number;
}) {
  return (
    <section className="mt-2 bg-white px-3 py-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold leading-none text-ink-900">مملكة القراء</h2>
        <span className="flex items-center gap-1 text-[13px] leading-none text-ink-300">
          <span>عرض كل المنشورات ({commentsCount} نقاش)</span>
          <svg width="12" height="14" viewBox="0 0 24 28" aria-hidden className="shrink-0">
            <path
              fill="#e2453c"
              d="M13.2 0c.9 4.2-1.1 6.6-3.2 9-2.3 2.6-4.8 5.2-4.8 9.2 0 2.4.9 4.4 2.3 5.8-.3-2.6.7-4.5 2.4-6.2 1.2-1.2 2.5-2.5 2.9-4.7 3.2 2.3 5.4 5.9 5.4 9.1 0 2.4-1 4.5-2.7 5.9C19.7 25.8 22 22.6 22 18.600 22 11.300 16.300 6.900 13.200 0Z"
            />
          </svg>
          <span aria-hidden className="text-[20px] leading-none text-ink-300">‹</span>
        </span>
      </div>
    </section>
  );
}
