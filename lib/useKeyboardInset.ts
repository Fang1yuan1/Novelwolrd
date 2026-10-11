"use client";

import { useEffect, useState } from "react";

// ارتفاع لوحة المفاتيح بالبكسل (iOS لا يصغّر الصفحة عند ظهورها) لتثبيت الشريط فوقها
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const f = () => setInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    f();
    vv.addEventListener("resize", f);
    vv.addEventListener("scroll", f);
    return () => {
      vv.removeEventListener("resize", f);
      vv.removeEventListener("scroll", f);
    };
  }, []);
  return inset;
}

// يمنع تمرير الصفحة خلف النافذة المفتوحة
export function useLockScroll() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}
