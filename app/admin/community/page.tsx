'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminAction, adminCheck, formatWhen, type CommunityPost } from '@/lib/community';

const SECRET_KEY = 'nw_cm_admin';

export default function AdminCommunityPage() {
  const [secret, setSecret] = useState('');
  const [ok, setOk] = useState(false);
  const [input, setInput] = useState('');
  const [err, setErr] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('community_posts_public')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setPosts((data as CommunityPost[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const s = sessionStorage.getItem(SECRET_KEY);
    if (s) {
      adminCheck(s).then((v) => {
        if (v) {
          setSecret(s);
          setOk(true);
          load();
        }
      });
    }
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (await adminCheck(input.trim())) {
      sessionStorage.setItem(SECRET_KEY, input.trim());
      setSecret(input.trim());
      setOk(true);
      load();
    } else {
      setErr('كلمة سر الإشراف غير صحيحة (أو لم تشغّل ملف supabase_add_community.sql).');
    }
  }

  async function act(id: number, action: 'pin' | 'unpin' | 'feature' | 'unfeature' | 'delete') {
    if (action === 'delete' && !confirm('حذف المنشور؟')) return;
    try {
      await adminAction(secret, 'post', id, action);
      load();
    } catch {
      alert('فشل التنفيذ');
    }
  }

  if (!ok) {
    return (
      <div dir="rtl" className="mx-auto max-w-sm p-6">
        <h1 className="mb-3 text-lg font-bold">إشراف مملكة القراء</h1>
        <form onSubmit={login} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="كلمة سر الإشراف (ظهرت لك بعد تشغيل ملف SQL)"
            className="rounded border border-ink-300/40 px-3 py-2 text-sm"
          />
          {err && <div className="text-[12px] text-red-700">{err}</div>}
          <button className="rounded bg-brand px-3 py-2 text-sm font-bold text-white">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl p-4">
      <h1 className="mb-1 text-lg font-bold">إشراف مملكة القراء</h1>
      <p className="mb-4 text-[12px] text-ink-500">
        «تثبيت» يعرض المنشور بصف أزرق أعلى المملكة، و«تمييز» يضعه بتبويب المختارات مع شارة «مميّز».
      </p>
      {loading && <div className="text-sm text-ink-500">جارٍ التحميل…</div>}
      <ul className="flex flex-col gap-3">
        {posts.map((p) => (
          <li key={p.id} className="rounded border border-ink-300/20 bg-white p-3 text-sm">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-500">
              <span className="font-bold text-ink-900">{p.author_name}</span>
              <span>«{p.novel_title}»</span>
              <span>{formatWhen(p.created_at)}</span>
              {p.is_pinned && <span className="rounded bg-blue-100 px-1 text-blue-700">مثبّت</span>}
              {p.is_featured && <span className="rounded bg-orange-100 px-1 text-orange-700">مميّز</span>}
            </div>
            {p.title && <div className="font-bold">{p.title}</div>}
            <div className="line-clamp-3 whitespace-pre-line">{p.body}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
              <button className="rounded border px-2 py-1" onClick={() => act(p.id, p.is_pinned ? 'unpin' : 'pin')}>
                {p.is_pinned ? 'إلغاء التثبيت' : 'تثبيت'}
              </button>
              <button className="rounded border px-2 py-1" onClick={() => act(p.id, p.is_featured ? 'unfeature' : 'feature')}>
                {p.is_featured ? 'إلغاء التمييز' : 'تمييز'}
              </button>
              <button className="rounded border border-red-300 px-2 py-1 text-red-700" onClick={() => act(p.id, 'delete')}>
                حذف
              </button>
              <a className="px-2 py-1 text-brand" href={`/novel/${p.novel_id}/community/${p.id}`} target="_blank">
                فتح
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
