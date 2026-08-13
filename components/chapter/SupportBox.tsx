export default function SupportBox() {
  return (
    <div className="flex flex-col items-center gap-2 rounded bg-white py-5 border border-ink-300/15">
      <button
        type="button"
        disabled
        title="الدعم المادي غير متاح بعد"
        className="rounded-full bg-ink-300/30 px-8 py-2 text-sm font-bold text-white"
      >
        دعم الكاتب · 0
      </button>
      <p className="text-[11px] text-ink-300">
        لا يوجد داعمون لهذا الفصل بعد — ميزة الدعم المادي غير مفعّلة حاليًا
      </p>
    </div>
  );
}
