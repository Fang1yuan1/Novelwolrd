"use client";

import { useAuth } from "@/lib/auth";

// زر هيدر الجوال: «تسجيل الدخول» ← بعد الدخول يصير «حسابي»
export function HeaderAuthButton() {
  const { user, ready, openLogin } = useAuth();
  if (!ready) return <span className="mobile-app-button" style={{ visibility: "hidden" }}>تسجيل الدخول</span>;
  if (user) {
    return (
      <a className="mobile-app-button" href="/account">
        حسابي
      </a>
    );
  }
  return (
    <button className="mobile-app-button" type="button" onClick={() => openLogin()}>
      تسجيل الدخول
    </button>
  );
}

// زر «سجل الآن» بشريط الترويج
export function PromoAuthButton() {
  const { user, ready, openLogin } = useAuth();
  if (!ready) return <span className="nw-promo-button" style={{ visibility: "hidden" }}>سجل الآن</span>;
  if (user) {
    return (
      <a href="/account" className="nw-promo-button">
        حسابي
      </a>
    );
  }
  return (
    <button type="button" className="nw-promo-button" onClick={() => openLogin()}>
      سجل الآن
    </button>
  );
}

// أزرار هيدر الشاشات الكبيرة
export function DesktopAuthLinks() {
  const { user, ready, openLogin } = useAuth();
  if (!ready) return null;
  if (user) {
    return (
      <a href="/account" className="rounded bg-brand px-3 py-1 font-medium text-white hover:bg-brand-dark">
        حسابي
      </a>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => openLogin()}
        className="rounded bg-brand px-3 py-1 font-medium text-white hover:bg-brand-dark"
      >
        تسجيل الدخول
      </button>
      <button type="button" onClick={() => openLogin()} className="hover:text-brand">
        إنشاء حساب
      </button>
    </>
  );
}
