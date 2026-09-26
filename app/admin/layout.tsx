'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * حماية صفحات Admin بكلمة سر
 * في الوقت الحالي: كلمة السر فارغة (اختياري)
 * لتغيير كلمة السر، عدّل قيمة ADMIN_PASSWORD
 */

const ADMIN_PASSWORD = 'عدمي فارغ'; // ✏️ كلمة السر: عدمي فارغ

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تحقق من كلمة السر المحفوظة في session
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    setAuthenticated(isAuth);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // إذا كانت كلمة السر فارغة، يمكن ترك الحقل فارغًا
    if (password !== ADMIN_PASSWORD) {
      setError('كلمة السر خاطئة.');
      return;
    }

    sessionStorage.setItem('admin_authenticated', 'true');
    setAuthenticated(true);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-ink-500">جارٍ التحميل…</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div
        dir="rtl"
        className="flex items-center justify-center min-h-screen bg-surface px-4"
      >
        <div className="w-full max-w-sm rounded border border-ink-300/20 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-lg font-bold text-ink-900">لوحة التحكم</h1>
          <p className="mb-6 text-[13px] text-ink-500">
            أدخل كلمة السر للدخول
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر"
                className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
                autoFocus
              />
            </div>
            {error && (
              <div className="rounded border border-red-300 bg-red-50 p-2 text-[12px] text-red-700">
                ❌ {error}
              </div>
            )}
            <button
              type="submit"
              className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              دخول
            </button>
          </form>

          {ADMIN_PASSWORD === '' && (
            <p className="mt-4 text-[11px] text-ink-400 border-t border-ink-300/20 pt-3">
              ⚠️ الوضع الحالي: كلمة السر فارغة (للاختبار فقط)
              <br />
              غيّر كلمة السر في الملف قبل النشر على الإنتاج!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* شريط الخروج */}
      <div className="border-b border-ink-300/20 bg-surface px-4 py-3 flex justify-end">
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_authenticated');
            setAuthenticated(false);
          }}
          className="text-[12px] text-ink-500 hover:text-brand"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* محتوى لوحة التحكم */}
      <div>
        {children}
      </div>
    </div>
  );
}
