export default function HonorsCard() {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <div className="mb-2 flex items-center justify-between border-b border-ink-300/20 pb-2">
        <h2 className="text-[13px] font-bold text-ink-900">تكريمات العمل</h2>
      </div>
      <p className="py-2 text-center text-[11px] text-ink-300">
        لا توجد تكريمات مسجّلة بعد.
      </p>
    </div>
  );
}
