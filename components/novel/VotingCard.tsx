export default function VotingCard() {
  return (
    <div
      id="vote"
      className="grid scroll-mt-3 grid-cols-1 gap-3 rounded bg-white p-3 border border-ink-300/15 sm:grid-cols-2"
    >
      <div className="border-ink-300/15 sm:border-e sm:pe-3">
        <p className="mb-1 text-sm font-bold text-ink-900">
          قسائم الشهر · أصوات التأييد
        </p>
        <p className="mb-2 text-2xl font-bold text-brand">0</p>
        <p className="mb-3 text-[11px] text-ink-300">
          لا توجد أصوات بعد — كن أول من يدعم هذا العمل.
        </p>
        <button
          type="button"
          className="rounded bg-brand px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-dark"
        >
          صوّت لهذا العمل
        </button>
      </div>
      <div>
        <p className="mb-1 text-sm font-bold text-ink-900">الدعم المادي</p>
        <p className="mb-2 text-2xl font-bold text-ink-900">0</p>
        <p className="mb-3 text-[11px] text-ink-300">
          لا يوجد داعمون هذا الأسبوع بعد.
        </p>
        <button
          type="button"
          className="rounded border border-ink-300/40 px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:border-brand hover:text-brand"
        >
          ادعم الكاتب
        </button>
      </div>
    </div>
  );
}
