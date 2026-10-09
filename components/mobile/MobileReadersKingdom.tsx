// قسم «مملكة القراء» بصفحة تفاصيل الرواية (يقابل 书友圈 بصفحة Qidian).
// حاليًا الشكل الخارجي فقط — نظام التعليقات الفعلي يُربط لاحقًا عبر الخاصية commentsCount والرابط.
// الألوان والأبعاد مقاسة بالبكسل من لقطة المرجع (شاشة بعرض 828px = 2×):
//   العنوان #191919 / النص #808080 / أيقونة النار #d34545 (12px ارتفاع) / السهم #cccccc (6×10px)
export default function MobileReadersKingdom({
  commentsCount = 0,
}: {
  commentsCount?: number;
}) {
  return (
    <section className="mt-2 bg-white px-3 py-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold leading-none text-ink-900">مملكة القراء</h2>
        <span className="flex items-center text-[14px] leading-none text-[#808080]">
          <span>عرض كل المنشورات ({commentsCount} نقاش)</span>
          {/* نسخة مستقلة من أيقونة النار (flame-kingdom.png) بلون المرجع، منفصلة عن أيقونة القراءة التجريبية */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/flame-kingdom.png"
            alt=""
            aria-hidden
            className="mr-[6px] h-[12px] w-auto shrink-0"
          />
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            aria-hidden
            className="mr-[9px] shrink-0"
          >
            <path
              d="M5 1 1 5l4 4"
              fill="none"
              stroke="#cccccc"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </section>
  );
}
