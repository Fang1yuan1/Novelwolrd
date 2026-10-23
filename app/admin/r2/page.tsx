'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type NovelRow = { id: number; title: string };
const KEY = 'nw_admin_api_secret';

export default function AdminR2Page() {
  const [secret, setSecret] = useState('');
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [novelId, setNovelId] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const stop = useRef(false);

  useEffect(() => {
    setSecret(sessionStorage.getItem(KEY) || '');
    supabase?.from('novels').select('id, title').order('id').then(({ data }) => setNovels((data as NovelRow[]) ?? []));
  }, []);

  const say = (m: string) => setLog((l) => [...l.slice(-60), m]);

  async function call(url: string, body: Record<string, unknown>) {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret, ...body }) });
    const j = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
    return j as Record<string, any>;
  }

  async function test() {
    sessionStorage.setItem(KEY, secret);
    setBusy(true);
    say('فحص الاتصال بـR2…');
    const j = await call('/api/r2-test', {});
    say(j.ok ? '✅ الاتصال سليم: كُتب ملف تجريبي وقُرئ وحُذف.' : `❌ ${j.error || 'فشل الفحص'}`);
    setBusy(false);
  }

  async function moveNovel(id: number, title: string): Promise<boolean> {
    const st = await call('/api/r2-migrate', { action: 'status', novelId: id });
    if (!st.ok) { say(`❌ ${title}: ${st.error}`); return false; }
    if (st.inDb === 0) { say(`✓ «${title}»: كل فصولها (${st.total}) على R2 مسبقًا.`); return true; }
    say(`▶ «${title}»: ${st.inDb} فصل بقاعدة البيانات من ${st.total}…`);
    let afterId = 0;
    let done = 0;
    let failed = 0;
    while (!stop.current) {
      const j = await call('/api/r2-migrate', { action: 'move', novelId: id, afterId });
      if (!j.ok) { say(`❌ ${title}: ${j.error}`); return false; }
      done += j.moved || 0;
      failed += j.failed || 0;
      if (j.errors?.length) j.errors.forEach((e: string) => say(`⚠ ${e}`));
      afterId = j.lastId ?? afterId;
      say(`… ${done} / ${st.inDb}${failed ? ` (فشل ${failed})` : ''}`);
      if (j.done) break;
    }
    say(failed ? `⚠ «${title}» انتهت مع ${failed} فشل (الفصول الفاشلة بقيت بقاعدة البيانات، أعد التشغيل).` : `✅ «${title}» انتقلت بالكامل.`);
    return failed === 0;
  }

  async function run(all: boolean) {
    sessionStorage.setItem(KEY, secret);
    stop.current = false;
    setBusy(true);
    const list = all ? novels : novels.filter((n) => String(n.id) === novelId);
    for (const n of list) {
      if (stop.current) break;
      await moveNovel(n.id, n.title);
    }
    say(stop.current ? '⏹ أُوقف.' : '— انتهى —');
    setBusy(false);
  }

  return (
    <div dir="rtl" className="mx-auto max-w-2xl p-4 text-sm">
      <h1 className="mb-1 text-lg font-bold">نقل نصوص الفصول إلى R2</h1>
      <p className="mb-4 text-[12px] text-ink-500">
        يرفع نص كل فصل إلى Cloudflare R2، ويقرؤه للتأكد، وبعدها فقط يفرّغ نسخته من قاعدة البيانات. الفصول الفاشلة لا يُحذف نصها.
      </p>

      <label className="mb-1 block font-bold">كلمة سر الإدارة (ADMIN_API_SECRET)</label>
      <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} className="mb-3 w-full rounded border border-ink-300/40 px-3 py-2" />
      <button disabled={busy || !secret} onClick={test} className="mb-5 rounded bg-brand px-4 py-2 font-bold text-white disabled:opacity-50">
        1) فحص الاتصال بـR2
      </button>

      <label className="mb-1 block font-bold">2) نقل رواية واحدة (جرّب رواية صغيرة أولًا)</label>
      <select value={novelId} onChange={(e) => setNovelId(e.target.value)} className="mb-2 w-full rounded border border-ink-300/40 px-3 py-2">
        <option value="">— اختر رواية —</option>
        {novels.map((n) => (
          <option key={n.id} value={n.id}>
            {n.id} — {n.title}
          </option>
        ))}
      </select>
      <div className="mb-5 flex flex-wrap gap-2">
        <button disabled={busy || !secret || !novelId} onClick={() => run(false)} className="rounded bg-brand px-4 py-2 font-bold text-white disabled:opacity-50">
          نقل هذه الرواية
        </button>
        <button
          disabled={busy || !secret || novels.length === 0}
          onClick={() => confirm('نقل كل الروايات؟ تأكد أن التجربة على رواية واحدة نجحت.') && run(true)}
          className="rounded border border-brand px-4 py-2 font-bold text-brand disabled:opacity-50"
        >
          3) نقل كل الروايات
        </button>
        <button disabled={!busy} onClick={() => (stop.current = true)} className="rounded border px-4 py-2 disabled:opacity-40">
          إيقاف
        </button>
      </div>

      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-ink-900 p-3 text-[12px] leading-6 text-green-300">{log.join('\n') || 'جاهز.'}</pre>
    </div>
  );
}
