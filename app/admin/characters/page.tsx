'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NovelOption = { id: number; title: string; cover_url: string | null };
type Character = {
  id: number;
  novel_id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  description: string | null;
  likes: number;
  sort_order: number;
};

const emptyForm = {
  name: '',
  role: '',
  avatar_url: '',
  description: '',
  likes: '0',
  sort_order: '0',
};

export default function AdminCharactersPage() {
  const [novels, setNovels] = useState<NovelOption[]>([]);
  const [search, setSearch] = useState('');
  const [selectedNovel, setSelectedNovel] = useState<NovelOption | null>(null);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingChars, setLoadingChars] = useState(false);

  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('novels')
        .select('id, title, cover_url')
        .order('created_at', { ascending: false });
      if (data) setNovels(data as NovelOption[]);
    })();
  }, []);

  async function loadCharacters(novelId: number) {
    setLoadingChars(true);
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('novel_id', novelId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    setLoadingChars(false);
    if (!error && data) setCharacters(data as Character[]);
    else setCharacters([]);
  }

  function pickNovel(n: NovelOption) {
    setSelectedNovel(n);
    setEditingId(null);
    setForm(emptyForm);
    loadCharacters(n.id);
  }

  function startNew() {
    setEditingId('new');
    setForm(emptyForm);
  }

  function startEdit(c: Character) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      role: c.role || '',
      avatar_url: c.avatar_url || '',
      description: c.description || '',
      likes: String(c.likes ?? 0),
      sort_order: String(c.sort_order ?? 0),
    });
  }

  async function save() {
    if (!selectedNovel || !form.name.trim()) {
      alert('اسم الشخصية مطلوب.');
      return;
    }
    setSaving(true);
    const payload = {
      novel_id: selectedNovel.id,
      name: form.name.trim(),
      role: form.role.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      description: form.description.trim() || null,
      likes: Number(form.likes) || 0,
      sort_order: Number(form.sort_order) || 0,
    };

    const { error } =
      editingId === 'new'
        ? await supabase.from('characters').insert(payload)
        : await supabase.from('characters').update(payload).eq('id', editingId);

    setSaving(false);
    if (error) {
      alert(`فشل الحفظ: ${error.message}`);
      return;
    }
    setEditingId(null);
    setForm(emptyForm);
    loadCharacters(selectedNovel.id);
  }

  async function remove(id: number) {
    if (!selectedNovel) return;
    if (!confirm('متأكد من حذف الشخصية دي؟')) return;
    setDeletingId(id);
    const { error } = await supabase.from('characters').delete().eq('id', id);
    setDeletingId(null);
    if (error) {
      alert(`فشل الحذف: ${error.message}`);
      return;
    }
    loadCharacters(selectedNovel.id);
  }

  const filteredNovels = novels.filter((n) =>
    n.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-8 font-sans text-ink-900">
      <a href="/admin" className="mb-4 inline-block text-[13px] text-ink-500 hover:text-brand">
        ‹ رجوع للوحة التحكم
      </a>
      <h1 className="mb-1 text-xl font-bold">إدارة الشخصيات</h1>
      <p className="mb-6 text-[13px] text-ink-500">
        اختار رواية الأول، وبعدين ضيف/عدّل/احذف شخصياتها. بتظهر بصفحة تفاصيل الرواية بالنسخة المبسّطة (الموبايل).
      </p>

      {!selectedNovel ? (
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر على رواية بالاسم…"
            className="mb-3 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
          />
          <ul className="flex flex-col gap-2">
            {filteredNovels.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => pickNovel(n)}
                  className="flex w-full items-center gap-3 rounded border border-ink-300/25 p-2 text-right hover:border-brand"
                >
                  {n.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.cover_url} alt={n.title} className="h-14 w-10 rounded object-cover" />
                  ) : (
                    <span className="ph-block flex h-14 w-10 items-center justify-center rounded text-[9px]">
                      غلاف
                    </span>
                  )}
                  <span className="text-sm font-medium">{n.title}</span>
                </button>
              </li>
            ))}
            {filteredNovels.length === 0 && (
              <p className="text-[13px] text-ink-300">مفيش نتائج.</p>
            )}
          </ul>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between rounded border border-ink-300/25 p-3">
            <span className="text-sm font-semibold">{selectedNovel.title}</span>
            <button
              onClick={() => {
                setSelectedNovel(null);
                setCharacters([]);
              }}
              className="text-[12px] text-ink-300 hover:text-brand"
            >
              تغيير الرواية
            </button>
          </div>

          {loadingChars ? (
            <p className="text-[13px] text-ink-300">جارٍ التحميل…</p>
          ) : (
            <ul className="mb-4 flex flex-col gap-2">
              {characters.map((c) => (
                <li key={c.id} className="rounded border border-ink-300/25 p-3">
                  <div className="flex items-center gap-3">
                    {c.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatar_url} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="ph-block flex h-12 w-12 items-center justify-center rounded-full text-[9px]">
                        صورة
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{c.name}</span>
                      <span className="block text-[12px] text-ink-500">{c.role || '—'}</span>
                    </span>
                    <span className="flex shrink-0 gap-3">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-[12px] text-ink-300 hover:text-brand"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        disabled={deletingId === c.id}
                        className="text-[12px] text-ink-300 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === c.id ? 'جارٍ الحذف…' : 'حذف'}
                      </button>
                    </span>
                  </div>
                </li>
              ))}
              {characters.length === 0 && (
                <p className="text-[13px] text-ink-300">مفيش شخصيات مضافة لسه لهذه الرواية.</p>
              )}
            </ul>
          )}

          {editingId === null ? (
            <button
              onClick={startNew}
              className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              + إضافة شخصية جديدة
            </button>
          ) : (
            <div className="rounded border border-ink-300/25 p-4">
              <h2 className="mb-3 text-sm font-bold">
                {editingId === 'new' ? 'شخصية جديدة' : 'تعديل الشخصية'}
              </h2>
              <div className="flex flex-col gap-3">
                <label className="text-[12px] text-ink-500">
                  الاسم *
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-[12px] text-ink-500">
                  الدور (مثال: البطل، الشخصية المساعدة)
                  <input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-[12px] text-ink-500">
                  رابط صورة الشخصية
                  <input
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://…"
                    className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-[12px] text-ink-500">
                  وصف مختصر
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex gap-3">
                  <label className="flex-1 text-[12px] text-ink-500">
                    عدد الإعجابات المعروض
                    <input
                      value={form.likes}
                      onChange={(e) => setForm({ ...form, likes: e.target.value })}
                      inputMode="numeric"
                      className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex-1 text-[12px] text-ink-500">
                    ترتيب الظهور (الأصغر يظهر الأول)
                    <input
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                      inputMode="numeric"
                      className="mt-1 w-full rounded border border-ink-300/25 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'جارٍ الحفظ…' : 'حفظ'}
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="rounded border border-ink-300/25 px-4 py-2 text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
