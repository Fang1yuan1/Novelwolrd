"use client";

export default function MobileCategoriesHeader({
  rightSlot,
}: {
  rightSlot: React.ReactNode;
}) {
  return (
    <header className="mobile-cat-header">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) window.history.back();
          else window.location.href = "/";
        }}
        aria-label="رجوع"
        className="mobile-cat-back"
      >
        →
      </button>
      <h1 className="mobile-cat-title">التصنيفات</h1>
      <div className="mobile-cat-actions">{rightSlot}</div>
    </header>
  );
}
