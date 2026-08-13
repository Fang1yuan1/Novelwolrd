export default function ChapterLeftRail() {
  return (
    <div className="fixed bottom-4 left-2 z-10 hidden flex-col gap-2 rounded bg-white border border-ink-300/15 p-1 lg:flex">
      <a
        href="mailto:contact@novelwolrd.com?subject=إبلاغ عن مشكلة"
        title="إبلاغ عن مشكلة بهذا الفصل"
        className="flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] text-ink-500 hover:text-brand"
      >
        <span aria-hidden className="text-base">
          ⚠️
        </span>
        إبلاغ
      </a>
      <a
        href="mailto:contact@novelwolrd.com?subject=ملاحظات"
        title="إرسال ملاحظات"
        className="flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] text-ink-500 hover:text-brand"
      >
        <span aria-hidden className="text-base">
          💬
        </span>
        ملاحظات
      </a>
    </div>
  );
}
