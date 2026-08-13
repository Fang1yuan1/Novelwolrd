export default function ChapterTopBar({
  category,
  publishedAt,
  wordCount,
}: {
  category: string | null;
  publishedAt: string;
  wordCount: number;
}) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="grid grid-cols-3 divide-x divide-x-reverse divide-ink-300/15 rounded bg-white border border-ink-300/15 py-3 text-center">
      <div>
        <p className="text-sm font-bold text-ink-900">{category || "—"}</p>
        <p className="mt-0.5 text-[11px] text-ink-300">التصنيف</p>
      </div>
      <div>
        <p className="text-sm font-bold text-ink-900">{formattedDate}</p>
        <p className="mt-0.5 text-[11px] text-ink-300">تاريخ النشر</p>
      </div>
      <div>
        <p className="text-sm font-bold text-ink-900">
          {wordCount.toLocaleString("ar-EG")}
        </p>
        <p className="mt-0.5 text-[11px] text-ink-300">عدد الأحرف</p>
      </div>
    </div>
  );
}
