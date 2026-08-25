"use client";

import { useState } from "react";

export default function MobileGenderHeader({
  title,
  rightSlot,
}: {
  title: string;
  /** أيقونات إضافية على يمين الهيدر (زي البحث/الشبكة بصفحة التصنيفات) */
  rightSlot?: React.ReactNode;
}) {
  const [active, setActive] = useState<"m" | "f">("m");

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

      <div className="mobile-gender-switch" role="tablist" aria-label="تصفية">
        <button
          type="button"
          role="tab"
          aria-selected={active === "m"}
          className={active === "m" ? "is-active" : ""}
          onClick={() => setActive("m")}
        >
          رجالة
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "f"}
          className={active === "f" ? "is-active" : ""}
          onClick={() => setActive("f")}
        >
          بنات
        </button>
      </div>

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
