"use client";

export default function MobileBackHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-ink-300/10 bg-white px-2 py-2.5">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/";
          }
        }}
        aria-label="رجوع"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-lg text-ink-700"
      >
        →
      </button>
      <h1 className="line-clamp-1 flex-1 text-[15px] font-semibold text-ink-900">
        {title}
      </h1>
      <a
        href="/"
        aria-label="الرئيسية"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-700"
      >
        🏠
      </a>
    </header>
  );
}
