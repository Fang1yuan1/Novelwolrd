'use client';

import { useEffect, useState } from 'react';
import {
  fetchDisplayLanguage,
  saveDisplayLanguage,
  type DisplayLanguage,
} from '@/lib/display-language';

export default function DisplayLanguagePage() {
  const [lang, setLang] = useState<DisplayLanguage>('ar');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { lang, error } = await fetchDisplayLanguage();
      setLang(lang);
      setLoadError(error);
      setLoading(false);
    })();
  }, []);

  async function choose(next: DisplayLanguage) {
    if (next === lang || saving) return;
    setSaving(true);
    setMessage(null);
    const result = await saveDisplayLanguage(next);
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: 'error', text: `فشل الحفظ: ${result.message}` });
      return;
    }
    setLang(next);
    setMessage({ type: 'ok', text: 'تم الحفظ ✅ الصفحات التالية اللي يفتحها الزوار بتطلع بالاسم الجديد فورًا.' });
  }

  return (
    <div dir="rtl" className="mx-auto max-w-xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← لوحة التحكم
      </a>
      <h1 className="mb-1 text-xl font-bold">لغة أسماء الروايات بالموقع</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        يتحكم بالاسم اللي يظهر للزوار بكل مكان (الصفحة الرئيسية، التصنيفات، القوائم، صفحة الرواية):
        الاسم العربي ولا الاسم الإنجليزي (لو محفوظ للرواية). لو رواية معينة ما لهاش اسم إنجليزي
        محفوظ، بيظهر اسمها العربي تلقائيًا حتى لو اخترت «إنجليزي» هنا.
      </p>

      {loadError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-700">
          تعذّر تحميل الإعداد المحفوظ: {loadError}
          <br />
          لو هذي أول مرة، شغّل ملف <code dir="ltr">supabase_add_site_settings.sql</code> في Supabase →
          SQL Editor مرة واحدة، ثم حدّث الصفحة.
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">جارٍ التحميل…</p>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose('ar')}
            disabled={saving}
            className={`flex-1 rounded border px-4 py-3 text-sm font-medium disabled:opacity-60 ${
              lang === 'ar'
                ? 'border-brand bg-brand text-white'
                : 'border-ink-300/40 text-ink-700 hover:border-brand'
            }`}
          >
            عربي
          </button>
          <button
            type="button"
            onClick={() => choose('en')}
            disabled={saving}
            className={`flex-1 rounded border px-4 py-3 text-sm font-medium disabled:opacity-60 ${
              lang === 'en'
                ? 'border-brand bg-brand text-white'
                : 'border-ink-300/40 text-ink-700 hover:border-brand'
            }`}
          >
            إنجليزي
          </button>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 rounded border p-3 text-[13px] ${
            message.type === 'ok'
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="mt-6 text-[12px] text-ink-400">
        ملاحظة: هذا الإعداد مفعّل حاليًا بالصفحة الرئيسية، صفحة الرواية، وقوائم الروايات (التصنيفات،
        الأكثر قراءة، المكتملة…). باقي الصفحات هنوسّع لها لاحقًا لو الفكرة عجبتك.
      </p>
    </div>
  );
}
