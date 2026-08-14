'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Category = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
};

const SUGGESTED_ICONS = ['📚', '🐉', '✨', '🥋', '🗡️', '🏙️', '📖', '⚔️', '🏛️', '🎮', '🏆', '🚀', '🌌', '🔍', '🌙', '💕', '😱', '😂', '🕵️'];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [deletingId, setDeletingId] = useState<number | null>(null);

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
            <li
              key={c.id}
              className="flex items-center justify-between rounded border border-ink-300/20 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className="text-lg">{c.icon || '📚'}</span>
                <span>{c.name}</span>
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="text-[12px] text-ink-300 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === c.id ? 'جارٍ الحذف…' : 'حذف'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
