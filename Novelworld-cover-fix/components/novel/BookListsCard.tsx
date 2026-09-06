export default function BookListsCard() {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2 className="text-sm font-bold text-ink-900">قوائم تحتوي هذا العمل</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1 rounded border border-dashed border-ink-300/30 px-2 py-4 text-center"
          >
            <span className="text-lg text-ink-300" aria-hidden>
              📋
            </span>
            <p className="text-[11px] text-ink-300">لا توجد قائمة قراءة هنا بعد</p>
          </div>
        ))}
      </div>
    </div>
  );
}
