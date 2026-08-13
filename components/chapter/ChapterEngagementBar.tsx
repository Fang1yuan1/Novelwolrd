export default function ChapterEngagementBar() {
  return (
    <div className="flex items-center justify-between rounded bg-white px-3 py-2 border border-ink-300/15 text-[12px] text-ink-300">
      <span className="flex items-center gap-1.5">
        <span aria-hidden>💬</span>
        لا توجد تعليقات على هذا الفصل بعد
      </span>
      <button
        type="button"
        title="حفظ الفصل — يتطلب حساب (قريبًا)"
        className="text-ink-300 hover:text-brand"
        disabled
      >
        <span aria-hidden className="text-base">
          🔖
        </span>
      </button>
    </div>
  );
}
