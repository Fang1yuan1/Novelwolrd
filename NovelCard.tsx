import type { Book } from "@/lib/placeholder-data";

type NovelCardProps = {
  book: Book;
  orientation?: "horizontal" | "vertical";
};

export default function NovelCard({
  book,
  orientation = "horizontal",
}: NovelCardProps) {
  if (orientation === "vertical") {
    return (
      <a
        href="#"
        className="group flex w-28 shrink-0 flex-col gap-2 sm:w-32"
      >
        <span className="ph-block aspect-[3/4] w-full rounded text-xs">
          الغلاف
        </span>
        <span className="line-clamp-2 text-xs font-medium text-ink-700 group-hover:text-brand">
          {book.title}
        </span>
      </a>
    );
  }

  return (
    <a
      href="#"
      className="flex gap-3 rounded-md p-2 hover:bg-surface"
    >
      <span className="ph-block h-20 w-16 shrink-0 rounded text-[10px]">
        الغلاف
      </span>
      <span className="min-w-0">
        <span className="mb-1 flex items-center gap-2">
          <span className="line-clamp-1 text-sm font-semibold text-ink-900">
            {book.title}
          </span>
          {book.tag && (
            <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
              {book.tag}
            </span>
          )}
        </span>
        <span className="line-clamp-2 block text-xs text-ink-500">
          {book.blurb}
        </span>
        {book.stat && (
          <span className="mt-1 block text-[11px] text-ink-300">
            {book.stat}
          </span>
        )}
      </span>
    </a>
  );
}
