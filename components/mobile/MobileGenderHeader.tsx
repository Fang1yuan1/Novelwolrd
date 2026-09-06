"use client";

export default function MobileGenderHeader({
  title,
  rightSlot,
}: {
  title: string;
  /** أيقونات إضافية على يمين الهيدر (زي البحث/الشبكة بصفحة التصنيفات) */
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="mobile-gender-header">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) window.history.back();
          else window.location.href = "/";
        }}
        aria-label="رجوع"
        className="mobile-gender-back"
      >
        →
      </button>

      <h1 className="mobile-gender-title">{title}</h1>

      <div className="mobile-gender-actions">
        {rightSlot ?? (
          <a href="/" aria-label="القائمة" className="mobile-gender-icon-btn">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/header/menu.png" alt="" className="h-[19px] w-[19px] object-contain" aria-hidden="true" />
          </a>
        )}
      </div>
    </header>
  );
}
