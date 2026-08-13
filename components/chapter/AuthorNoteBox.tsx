export default function AuthorNoteBox({ author }: { author: string | null }) {
  return (
    <div className="rounded bg-white p-3 border border-ink-300/15">
      <p className="mb-1.5 text-[11px] font-semibold text-ink-500">
        كلمة الكاتب{author ? ` — ${author}` : ""}
      </p>
      <p className="text-[12px] leading-relaxed text-ink-300">
        لا توجد ملاحظة من الكاتب على هذا الفصل بعد.
      </p>
    </div>
  );
}
