'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COVER_BUCKET = 'covers'; // لازم تنشئ Bucket بنفس الاسم ده في Supabase Storage وتخليه Public

export default function AddNovelPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { ok: true; id: number } | { ok: false; message: string } | null
  >(null);

  useEffect(() => {
    async function loadCategories() {
      // 1) التصنيفات الرسمية من جدول categories
      const { data: catRows } = await supabase.from('categories').select('name').order('name');
      const official = (catRows || []).map((r: any) => r.name as string);

      // 2) أي تصنيفات قديمة اتكتبت يدوي في روايات قبل ما جدول categories يتعمل
      const { data: novelRows } = await supabase
        .from('novels')
        .select('category')
        .not('category', 'is', null);
      const legacy = (novelRows || []).flatMap((r: any) =>
        ((r.category as string) || '').split(',').map((c) => c.trim())
      );

      const unique = Array.from(new Set([...official, ...legacy].filter(Boolean))).sort();
      setCategories(unique);
    }
    loadCategories();
  }, []);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function addNewCategory() {
    const c = newCategory.trim();
    if (!c) return;
    if (!categories.includes(c)) setCategories((prev) => [...prev, c].sort());
    if (!selectedCategories.includes(c)) setSelectedCategories((prev) => [...prev, c]);
    setNewCategory('');
  }

  async function handleCoverUpload(file: File): Promise<string | null> {
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(COVER_BUCKET)
        .upload(path, file);
      if (uploadError) {
        setResult({
          ok: false,
          message: `فشل رفع الغلاف: ${uploadError.message} — تأكد إن Bucket اسمه "${COVER_BUCKET}" موجود وPublic في Supabase Storage`,
        });
        return null;
      }
      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (!title.trim()) {
      setResult({ ok: false, message: 'العنوان مطلوب.' });
      return;
    }

    const finalCategory = selectedCategories.join(',');

    setSubmitting(true);

    let finalCoverUrl = coverUrl.trim();
    if (coverFile) {
      const uploaded = await handleCoverUpload(coverFile);
      if (uploaded) finalCoverUrl = uploaded;
      else {
        setSubmitting(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from('novels')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        cover_url: finalCoverUrl || null,
        category: finalCategory || null,
        author: author.trim() || null,
        status,
        tags: tags.trim() || null,
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (error || !data) {
      setResult({ ok: false, message: error?.message || 'حدث خطأ غير متوقع.' });
      return;
    }

    setResult({ ok: true, id: data.id });
    // تصفير الفورم بعد النجاح
    setTitle('');
    setAuthor('');
    setDescription('');
    setStatus('ongoing');
    setTags('');
    setCoverUrl('');
    setCoverFile(null);
    setSelectedCategories([]);
    setNewCategory('');
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin/upload" className="mb-1 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← رفع فصول رواية موجودة
      </a>
      <br />
      <a href="/admin/categories" className="mb-1 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← إدارة التصنيفات
      </a>
      <br />
      <a href="/admin/edit" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← تعديل رواية موجودة
      </a>
      <h1 className="mb-1 text-xl font-bold">إضافة رواية جديدة</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        الحقول المطلوبة: العنوان فقط. الباقي اختياري وتقدر تكمله بعدين من Supabase مباشرة.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="العنوان *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="اسم الرواية"
          />
        </Field>

        <Field label="المؤلف">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="اسم الكاتب"
          />
        </Field>

        <Field label="التصنيفات (تقدر تختار أكتر من واحد)">
          <div className="flex flex-wrap gap-2 rounded border border-ink-300/40 p-2">
            {categories.length === 0 && (
              <span className="text-[12px] text-ink-300">لا توجد تصنيفات بعد — أضف واحد تحت</span>
            )}
            {categories.map((c) => {
              const checked = selectedCategories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full border px-3 py-1 text-[12px] ${
                    checked
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-ink-300/40 text-ink-700 hover:border-brand hover:text-brand'
                  }`}
                >
                  {checked ? '✓ ' : ''}
                  {c}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewCategory();
                }
              }}
              className="flex-1 rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder="اكتب اسم تصنيف جديد ثم اضغط Enter أو الزر"
            />
            <button
              type="button"
              onClick={addNewCategory}
              className="rounded border border-ink-300/40 px-3 py-2 text-[12px] font-medium text-ink-700 hover:border-brand hover:text-brand"
            >
              + إضافة
            </button>
          </div>

          {selectedCategories.length > 0 && (
            <p className="mt-1 text-[11px] text-ink-500">
              المختار: {selectedCategories.join('، ')}
            </p>
          )}
          <p className="mt-1 text-[11px] text-ink-300">
            التصنيفات الحالية معروضة تلقائيًا من الروايات الموجودة. اكتب اسم جديد
            وهيتحفظ فورًا كتصنيف جديد مع هذه الرواية.
          </p>
        </Field>

        <Field label="الحالة">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed')}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="ongoing">مستمرة</option>
            <option value="completed">مكتملة</option>
          </select>
        </Field>

        <Field label="وسوم (مفصولة بفاصلة)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="مثال: VIP, روايات خفيفة, خيال أصلي"
          />
        </Field>

        <Field label="النبذة">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="نبذة عن الرواية…"
          />
        </Field>

        <Field label="غلاف الرواية">
          <div className="flex flex-col gap-2">
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              disabled={!!coverFile}
              className="w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand disabled:bg-surface disabled:text-ink-300"
              placeholder="رابط صورة الغلاف (اختياري)"
            />
            <div className="flex items-center gap-2 text-[12px] text-ink-500">
              <span>أو ارفع صورة مباشرة:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>
            <p className="text-[11px] text-ink-300">
              الرفع المباشر يحتاج Bucket اسمه &quot;{COVER_BUCKET}&quot; في Supabase
              Storage (خليه Public). لو مش عايز تعمله دلوقتي، استخدم حقل الرابط بس.
            </p>
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting || uploadingCover}
          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting || uploadingCover ? 'جارٍ الحفظ…' : 'حفظ الرواية'}
        </button>

        {result && result.ok && (
          <div className="rounded border border-green-300 bg-green-50 p-3 text-[13px] text-green-800">
            ✅ تم إنشاء الرواية بنجاح (ID: {result.id}).{' '}
            <a href={`/novel/${result.id}`} className="underline">
              عرض الصفحة
            </a>{' '}
            —{' '}
            <a href="/admin/upload" className="underline">
              ارفع فصولها الآن
            </a>
          </div>
        )}
        {result && !result.ok && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-[13px] text-red-800">
            ❌ {result.message}
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
