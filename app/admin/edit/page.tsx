'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NovelRow = {
  id: number;
  title: string;
  category: string | null;
  cover_url: string | null;
};

export default function EditNovelListPage() {
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('novels')
        .select('id, title, category, cover_url')
        .order('created_at', { ascending: false });
      if (!error && data) setNovels(data as NovelRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = novels.filter((n) =>
    n.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-4 py-8 font-sans text-ink-900">
      <div className="mb-4 flex flex-wrap gap-3 text-[13px] text-ink-500">
        <a href="/admin/novel" className="hover:text-brand">← إضافة رواية جديدة</a>
        <a href="/admin/categories" className="hover:text-brand">← إدارة التصنيفات</a>
      </div>

      <h1 className="mb-1 text-xl font-bold">تعديل رواية</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        اختر الرواية اللي عايز تعدّل بياناتها، غلافها، أو تصنيفاتها.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded border border-ink-300/40 px-3 py-2 text-sm outline-none focus:border-brand"
        placeholder="ابحث باسم الرواية…"
      />

      {loading ? (
        <p className="text-[13px] text-ink-300">جارٍ التحميل…</p>
      ) : filtered.length === 0 ? (
        <p className="text-[13px] text-ink-300">لا توجد روايات مطابقة.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((n) => (
            <li key={n.id}>
              <a
                href={`/admin/edit/${n.id}`}
                className="flex items-center gap-3 rounded border border-ink-300/20 p-2 hover:border-brand"
              >
                {n.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.cover_url}
                    alt={n.title}
                    className="h-14 w-11 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-11 shrink-0 items-center justify-center rounded bg-surface text-[9px] text-ink-300">
                    غلاف
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{n.title}</span>
                  <span className="block text-[11px] text-ink-300">
                    {n.category || 'بدون تصنيف'}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
