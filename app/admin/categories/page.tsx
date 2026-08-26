'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import CategoryIcon from '@/components/CategoryIcon';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Category = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
  cover_novel_id: number | null;
};

type NovelOption = { id: number; title: string; cover_url: string | null };

const SUGGESTED_ICONS = ['📚', '🐉', '✨', '🥋', '🗡️', '🏙️', '📖', '⚔️', '🏛️', '🎮', '🏆', '🚀', '🌌', '🔍', '🌙', '💕', '😱', '😂', '🕵️'];

// أيقونات الصور الجاهزة (مقصوصة من التصميم المرجعي) — تُستخدم بدل الإيموجي لو حبيت
const IMAGE_ICONS = [
  { label: 'ألعاب', path: '/icons/categories/games.png' },
  { label: 'تاريخ', path: '/icons/categories/history.png' },
  { label: 'حرب واستراتيجية', path: '/icons/categories/war-strategy.png' },
  { label: 'حياة حضرية', path: '/icons/categories/urban-life.png' },
  { label: 'خيال علمي', path: '/icons/categories/scifi.png' },
  { label: 'خيال ملحمي', path: '/icons/categories/epic-fantasy.png' },
  { label: 'روايات خفيفة', path: '/icons/categories/light-novels.png' },
  { label: 'رياضة', path: '/icons/categories/sports.png' },
  { label: 'غموض', path: '/icons/categories/mystery.png' },
  { label: 'فنون قتالية', path: '/icons/categories/martial-arts.png' },
  { label: 'واقعية', path: '/icons/categories/realistic.png' },
  { label: 'عجائبي', path: '/icons/categories/fantasy-whimsical.png' },
  { label: 'شينشيا (خلود)', path: '/icons/categories/xianxia.png' },
  { label: 'عوالم لا نهائية', path: '/icons/categories/infinite-worlds.png' },
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editIcon, setEditIcon] = useState('');
  const [savingIcon, setSavingIcon] = useState(false);

  const [coverEditingId, setCoverEditingId] = useState<number | null>(null);
  const [coverOptions, setCoverOptions] = useState<NovelOption[]>([]);
  const [loadingCovers, setLoadingCovers] = useState(false);
  const [savingCover, setSavingCover] = useState(false);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (!error && data) setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setError('اكتب اسم التصنيف الأول.');
      return;
    }
    if (categories.some((c) => c.name === trimmed)) {
      setError('التصنيف ده موجود بالفعل.');
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed, icon: icon.trim() || '📚' });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setName('');
    setIcon('📚');
    await loadCategories();
  }

  async function handleDelete(id: number) {
    if (!confirm('متأكد إنك عايز تحذف التصنيف ده؟')) return;
    setDeletingId(id);
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', id);
    setDeletingId(null);
    if (deleteError) {
      alert(`فشل الحذف: ${deleteError.message}`);
      return;
    }
    await loadCategories();
  }

  function startEditIcon(c: Category) {
    setEditingId(c.id);
    setEditIcon(c.icon || '');
  }

  async function saveIcon(id: number) {
    setSavingIcon(true);
    const { error: updateError } = await supabase
      .from('categories')
      .update({ icon: editIcon.trim() })
      .eq('id', id);
    setSavingIcon(false);
    if (updateError) {
      alert(`فشل الحفظ: ${updateError.message}`);
      return;
    }
    setEditingId(null);
    await loadCategories();
  }

  async function openCoverPicker(c: Category) {
    if (coverEditingId === c.id) {
      setCoverEditingId(null);
      return;
    }
    setCoverEditingId(c.id);
    setLoadingCovers(true);
    const { data, error } = await supabase
      .from('novels')
      .select('id, title, cover_url, category')
      .order('created_at', { ascending: false });
    setLoadingCovers(false);
    if (!error && data) {
      const inCategory = (data as any[]).filter((n) =>
        String(n.category || '')
          .split(/[,،]/)
          .map((s) => s.trim())
          .includes(c.name)
      );
      setCoverOptions(
        inCategory.map((n) => ({ id: n.id, title: n.title, cover_url: n.cover_url }))
      );
    }
  }

  async function saveCategoryCover(categoryId: number, novelId: number | null) {
    setSavingCover(true);
    const { error: updateError } = await supabase
      .from('categories')
      .update({ cover_novel_id: novelId })
      .eq('id', categoryId);
    setSavingCover(false);
    if (updateError) {
      alert(`فشل الحفظ: ${updateError.message}`);
      return;
    }
    await loadCategories();
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin" className="mb-1 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← لوحة التحكم
      </a>
      <br />
      <a href="/admin/novel" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ← إضافة رواية جديدة
      </a>
      <h1 className="mb-1 text-xl font-bold">إدارة التصنيفات</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        التصنيفات اللي تضيفها هنا هتظهر تلقائيًا في فورم إضافة الرواية عشان تقدر تختارها.
      </p>

      <form onSubmit={handleAdd} className="mb-8 flex flex-col gap-3 rounded border border-ink-300/40 p-4">
        <h2 className="text-sm font-bold">إضافة تصنيف جديد</h2>

        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder="اسم التصنيف (مثال: رومانسي)"
          />
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-20 rounded border border-ink-300/40 px-3 py-2 text-center text-lg outline-none focus:border-brand"
            placeholder="🙂"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`rounded border px-2 py-1 text-base ${
                icon === ic ? 'border-brand bg-brand/10' : 'border-ink-300/30 hover:border-brand'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? 'جارٍ الحفظ…' : '+ إضافة التصنيف'}
        </button>
      </form>

      <h2 className="mb-3 text-sm font-bold">التصنيفات الحالية ({categories.length})</h2>

      {loading ? (
        <p className="text-[13px] text-ink-300">جارٍ التحميل…</p>
      ) : categories.length === 0 ? (
        <p className="text-[13px] text-ink-300">لا توجد تصنيفات بعد — أضف أول واحد فوق.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li key={c.id} className="rounded border border-ink-300/20 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <CategoryIcon icon={c.icon} className="text-lg" imgClassName="h-6 w-6 object-contain" />
                  <span>{c.name}</span>
                </span>
                <span className="flex gap-3">
                  <button
                    onClick={() => (editingId === c.id ? setEditingId(null) : startEditIcon(c))}
                    className="text-[12px] text-ink-300 hover:text-brand"
                  >
                    {editingId === c.id ? 'إلغاء' : 'تعديل الأيقونة'}
                  </button>
                  <button
                    onClick={() => openCoverPicker(c)}
                    className="text-[12px] text-ink-300 hover:text-brand"
                  >
                    {coverEditingId === c.id ? 'إلغاء' : 'غلاف العرض'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="text-[12px] text-ink-300 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === c.id ? 'جارٍ الحذف…' : 'حذف'}
                  </button>
                </span>
              </div>

              {coverEditingId === c.id && (
                <div className="mt-3 flex flex-col gap-2 border-t border-ink-300/15 pt-3">
                  <p className="text-[11px] text-ink-300">
                    اختار غلاف رواية من نفس التصنيف عشان يظهر كغلاف عرض في صفحة "التصنيفات" بالنسخة المبسّطة (الموبايل). لو ما اخترتش، هيظهر تلقائيًا غلاف أول رواية بالتصنيف.
                  </p>
                  {loadingCovers ? (
                    <p className="text-[12px] text-ink-300">جارٍ التحميل…</p>
                  ) : coverOptions.length === 0 ? (
                    <p className="text-[12px] text-ink-300">مفيش روايات بالتصنيف ده لسه.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => saveCategoryCover(c.id, null)}
                        disabled={savingCover}
                        className={`flex h-16 w-12 flex-col items-center justify-center rounded border text-[10px] disabled:opacity-50 ${
                          c.cover_novel_id === null
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-ink-300/30 text-ink-300 hover:border-brand'
                        }`}
                      >
                        تلقائي
                      </button>
                      {coverOptions.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => saveCategoryCover(c.id, n.id)}
                          disabled={savingCover}
                          title={n.title}
                          className={`h-16 w-12 overflow-hidden rounded border disabled:opacity-50 ${
                            c.cover_novel_id === n.id
                              ? 'border-brand ring-2 ring-brand'
                              : 'border-ink-300/30 hover:border-brand'
                          }`}
                        >
                          {n.cover_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={n.cover_url} alt={n.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-ink-300/10 text-[9px] text-ink-300">
                              بدون
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editingId === c.id && (
                <div className="mt-3 flex flex-col gap-2 border-t border-ink-300/15 pt-3">
                  <div className="flex gap-2">
                    <input
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      placeholder="إيموجي أو مسار صورة زي /icons/categories/games.png"
                      className="flex-1 rounded border border-ink-300/40 px-3 py-2 text-[12px] outline-none focus:border-brand"
                    />
                    <button
                      onClick={() => saveIcon(c.id)}
                      disabled={savingIcon}
                      className="rounded bg-brand px-3 py-2 text-[12px] font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      {savingIcon ? 'جارٍ الحفظ…' : 'حفظ'}
                    </button>
                  </div>

                  <p className="text-[11px] text-ink-300">أيقونات جاهزة من التصميم المرجعي:</p>
                  <div className="flex flex-wrap gap-2">
                    {IMAGE_ICONS.map((ic) => (
                      <button
                        key={ic.path}
                        type="button"
                        onClick={() => setEditIcon(ic.path)}
                        title={ic.label}
                        className={`rounded border p-1.5 ${
                          editIcon === ic.path ? 'border-brand bg-brand/10' : 'border-ink-300/30 hover:border-brand'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ic.path} alt={ic.label} className="h-7 w-7 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
