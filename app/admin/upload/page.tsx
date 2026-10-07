'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { extractChapterTitle } from '@/lib/chapter-title';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BATCH_SIZE = 100;
const DELAY_MS = 150;

// يشيل NUL وبقية رموز التحكم غير المرئية اللي يرفضها Postgres/Supabase
function sanitizeForDb(text: string): string {
  return typeof text === 'string' ? text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') : text;
}

async function upsertOnce(rows: any[]) {
  return supabase.from('chapters').upsert(rows, { onConflict: 'novel_id,chapter_number' });
}

async function upsertWithRetry(rows: any[], attempt = 1): Promise<{ error: { message: string } | null; split?: boolean }> {
  const { error } = await upsertOnce(rows);
  if (!error) return { error: null };
  const isTimeout = /timeout/i.test(error.message);
  if (isTimeout && rows.length > 1) {
    const mid = Math.ceil(rows.length / 2);
    const a = await upsertWithRetry(rows.slice(0, mid), 1);
    const b = await upsertWithRetry(rows.slice(mid), 1);
    return { error: a.error || b.error, split: true };
  }
  if (attempt < 3) {
    await new Promise(r => setTimeout(r, 1000 * attempt));
    return upsertWithRetry(rows, attempt + 1);
  }
  return { error };
}

export default function UploadChaptersPage() {
  const [novelId, setNovelId] = useState('1');
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(false);

  function addLog(msg: string) {
    setLog(prev => [...prev, msg]);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let chapters: any[];
    try {
      chapters = JSON.parse(text);
    } catch {
      addLog('خطأ: الملف مو JSON صحيح');
      return;
    }
    setTotal(chapters.length);
    setRunning(true);
    setProgress(0);
    setLog([]);

    let failedCount = 0;
    let size = BATCH_SIZE;
    let i = 0;
    while (i < chapters.length) {
      const batch = chapters.slice(i, i + size).map((c: any) => {
        const content = sanitizeForDb((c.content || '').trim());
        // العنوان من داخل نص الفصل نفسه أولًا (أدق)، وإلا اللي جاي بالـJSON، وإلا بلا عنوان
        // عنوان الـJSON هو الأدق (استخرج بقواعد بايثون المطوّرة بالسكربت) — نثق فيه أول،
        // ونستخرج من النص بس لو الـJSON نفسه ما فيه عنوان أصلًا
        const jsonTitle = typeof c.title === 'string' ? c.title.trim() : '';
        const title = jsonTitle ? jsonTitle : extractChapterTitle(content, c.chapter_number);
        return {
          novel_id: Number(novelId),
          chapter_number: c.chapter_number,
          title,
          content,
        };
      });
      // محاولة حتى 3 مرات، ولو فشلت الدفعة نقسمها لنصفين بدل ما نخسرها كلها
      const { error, split } = await upsertWithRetry(batch);
      // لو حصل timeout نصغّر حجم الدفعة تلقائيًا، ولو مرّت بسلام نكبّرها تدريجيًا
      size = split ? Math.max(1, Math.floor(size / 2)) : Math.min(BATCH_SIZE, size + 10);
      const nums = batch.map((b: any) => b.chapter_number).join('، ');
      if (error) {
        addLog(`فشل: ${nums} — ${error.message}`);
        failedCount += batch.length;
      } else {
        addLog(`تم: ${nums}`);
      }
      i += batch.length;
      setProgress(i);
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    setRunning(false);
    addLog(failedCount ? `اكتمل مع ${failedCount} فشل` : 'اكتمل الرفع بنجاح ✅');
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', direction: 'rtl', maxWidth: 600, margin: '0 auto' }}>
      <a href="/admin" style={{ display: 'inline-block', marginBottom: 8, fontSize: 13 }}>
        ← لوحة التحكم
      </a>
      <br />
      <a href="/admin/novel" style={{ display: 'inline-block', marginBottom: 16, fontSize: 13 }}>
        ← إضافة رواية جديدة
      </a>
      <h1>رفع فصول</h1>
      <label>
        رقم الرواية (novel_id):{' '}
        <input value={novelId} onChange={e => setNovelId(e.target.value)} style={{ width: 60 }} />
      </label>
      <div style={{ marginTop: 16 }}>
        <input type="file" accept="application/json,.json" onChange={handleFile} disabled={running} />
      </div>
      {total > 0 && (
        <div style={{ marginTop: 16 }}>
          <div>{progress} / {total}</div>
          <div style={{ background: '#333', height: 10, borderRadius: 5 }}>
            <div style={{ background: '#4f8cff', height: '100%', width: `${(progress / total) * 100}%`, borderRadius: 5 }} />
          </div>
        </div>
      )}
      <div style={{ marginTop: 16, background: '#111', color: '#8f8', padding: 10, maxHeight: 400, overflowY: 'auto', fontSize: 12, direction: 'ltr', textAlign: 'left' }}>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
