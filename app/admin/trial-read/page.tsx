'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_TRIAL_READ_SETTINGS,
  fetchTrialReadSettings,
  normalizeTrialReadSettings,
  saveTrialReadSettings,
  type TrialReadSettings,
} from '@/lib/trial-read-settings';

type TextKey = 'tab1' | 'tab2' | 'tab3' | 'discussion';
type NumberKey = 'tabsSize' | 'discussionSize' | 'titleSize' | 'bodyOffset';

const TEXT_FIELDS: { key: TextKey; label: string; hint?: string }[] = [
  { key: 'tab1', label: 'التبويب الأول (النشط، بخط عريض وعلامة حمراء)' },
  { key: 'tab2', label: 'التبويب الثاني' },
  { key: 'tab3', label: 'التبويب الثالث' },
  { key: 'discussion', label: 'سطر النقاش (بجنب أيقونة النار)' },
];

const NUMBER_FIELDS: { key: NumberKey; label: string; hint: string; step: number }[] = [
  { key: 'tabsSize', label: 'حجم خط التبويبات', hint: 'بالبكسل', step: 0.5 },
  { key: 'discussionSize', label: 'حجم خط سطر النقاش', hint: 'بالبكسل', step: 0.5 },
  { key: 'titleSize', label: 'حجم خط عنوان الفصل', hint: 'بالبكسل', step: 0.5 },
  {
    key: 'bodyOffset',
    label: 'نص الفصل أصغر من خط صفحة القراءة بـ',
    hint: 'بكسل. كل ما زاد الرقم صغر النص، والسالب يكبّره',
    step: 1,
  },
];

export default function TrialReadAdminPage() {
  const [form, setForm] = useState<TrialReadSettings>(DEFAULT_TRIAL_READ_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { settings, error } = await fetchTrialReadSettings();
      setForm(settings);
      setLoadError(error);
      setLoading(false);
    })();
  }, []);

  function setText(key: TextKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  }

  // نخزّن نص الحقل الرقمي كما كتبه المستخدم أثناء الكتابة (عشان يقدر يمسح ويكتب)
  const [numberDrafts, setNumberDrafts] = useState<Partial<Record<NumberKey, string>>>({});

  function setNumber(key: NumberKey, raw: string) {
    setNumberDrafts((d) => ({ ...d, [key]: raw }));
    const n = Number(raw);
    if (raw.trim() !== '' && Number.isFinite(n)) {
      setForm((f) => ({ ...f, [key]: n }));
    }
    setMessage(null);
  }

  function numberValue(key: NumberKey): string {
    const draft = numberDrafts[key];
    return draft !== undefined ? draft : String(form[key]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const normalized = normalizeTrialReadSettings(form);
    const result = await saveTrialReadSettings(normalized);
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: 'error', text: `فشل الحفظ: ${result.message}` });
      return;
    }
    setForm(normalized);
    setNumberDrafts({});
    setMessage({ type: 'ok', text: 'تم الحفظ ✅ افتح أي رواية من الهاتف وحدّث الصفحة لتشوف التغيير.' });
  }

  function handleReset() {
    setForm(DEFAULT_TRIAL_READ_SETTINGS);
    setNumberDrafts({});
    setMessage({ type: 'ok', text: 'رجعت القيم الافتراضية بالنموذج. اضغط «حفظ» لو تبي تثبتها.' });
  }

  const preview = normalizeTrialReadSettings(form);
  // نفترض خط قراءة افتراضي 18 للمعاينة فقط
  const previewBody = Math.max(11, 18 - preview.bodyOffset);

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← لوحة التحكم
      </a>
      <h1 className="mb-1 text-xl font-bold">قسم الفصل التجريبي</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        عدّل كلمات التبويبات وسطر النقاش وأحجام الخطوط في آخر صفحة تفاصيل الرواية (الهاتف). اترك أي كلمة
        فاضية لو تبي تخفيها.
      </p>

      {loadError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-700">
          تعذّر تحميل الإعدادات المحفوظة: {loadError}
          <br />
          لو هذي أول مرة، شغّل ملف <code dir="ltr">supabase_add_site_settings.sql</code> في Supabase → SQL
          Editor مرة واحدة، ثم حدّث الصفحة.
        </div>
      )}

      {/* معاينة حيّة */}
      <div className="mb-6 rounded border border-ink-300/40 bg-white p-3">
        <div className="mb-2 text-[12px] text-ink-500">معاينة (تتغير أثناء الكتابة)</div>
        <div className="rounded bg-white px-3 py-3" style={{ border: '1px dashed #ddd' }}>
          {(preview.tab1 || preview.tab2 || preview.tab3) && (
            <div className="mb-[25.5px] flex items-center gap-4">
              {preview.tab1 && (
                <span className="relative font-bold" style={{ fontSize: preview.tabsSize, color: '#191919' }}>
                  {preview.tab1}
                  <span
                    aria-hidden
                    className="absolute -left-2 -top-0.5 h-[6px] w-[2.5px] -rotate-[20deg] rounded-full bg-brand"
                  />
                </span>
              )}
              {preview.tab2 && (
                <span style={{ fontSize: preview.tabsSize, color: '#999999' }}>{preview.tab2}</span>
              )}
              {preview.tab3 && (
                <span style={{ fontSize: preview.tabsSize, color: '#999999' }}>{preview.tab3}</span>
              )}
            </div>
          )}
          {preview.discussion && (
            <div className="mb-[22.5px] flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/flame.png" alt="" aria-hidden className="h-[15px] w-auto shrink-0 opacity-70" />
              <span style={{ fontSize: preview.discussionSize, color: '#999999' }}>{preview.discussion}</span>
            </div>
          )}
          <div className="mb-[27.5px] font-bold" style={{ fontSize: preview.titleSize, color: '#191919' }}>
            الفصل 1
          </div>
          <p
            className="text-center"
            style={{ fontSize: previewBody, lineHeight: `${Math.max(32, previewBody * 2)}px`, color: '#191919' }}
          >
            هذا نص تجريبي يشبه نص الفصل الأول ليظهر لك الحجم تقريبيًا.
          </p>
        </div>
        <div className="mt-1 text-[11px] text-ink-500">
          حجم نص الفصل بالمعاينة محسوب على خط قراءة 18 (الافتراضي). عند الزائر يتبع خط قراءته.
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">جارٍ التحميل…</p>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded border border-ink-300/40 p-4">
            <h2 className="text-sm font-bold">الكلمات</h2>
            {TEXT_FIELDS.map((f) => (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-[12px] text-ink-500">{f.label}</span>
                <input
                  value={form[f.key]}
                  onChange={(e) => setText(f.key, e.target.value)}
                  className="rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded border border-ink-300/40 p-4">
            <h2 className="text-sm font-bold">الخطوط</h2>
            {NUMBER_FIELDS.map((f) => (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-[12px] text-ink-500">
                  {f.label} <span className="text-ink-400">({f.hint})</span>
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step={f.step}
                  value={numberValue(f.key)}
                  onChange={(e) => setNumber(f.key, e.target.value)}
                  className="rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
            ))}
          </div>

          {message && (
            <div
              className={`rounded border p-3 text-[13px] ${
                message.type === 'ok'
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded border border-ink-300/40 px-4 py-2 text-sm text-ink-700 hover:border-brand"
            >
              استرجاع الافتراضي
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
