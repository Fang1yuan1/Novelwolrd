export default function CopyrightCard() {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <h2 className="mb-2 border-b border-ink-300/20 pb-2 text-[13px] font-bold text-ink-900">
        حقوق العمل
      </h2>
      <p className="mb-2 text-[11px] leading-relaxed text-ink-500">
        حقوق هذا العمل متاحة للتعاون (اقتباس، ترجمة، تحويل لصيغ أخرى). للتواصل
        بخصوص التعاون على الحقوق يرجى التواصل مع فريق المنصة.
      </p>
      <button
        type="button"
        className="w-full rounded border border-ink-300/40 px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:border-brand hover:text-brand"
      >
        التواصل بخصوص الحقوق
      </button>
    </div>
  );
}
