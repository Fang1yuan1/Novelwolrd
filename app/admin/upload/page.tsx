'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BATCH_SIZE = 5;
const DELAY_MS = 400;

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
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
      const batch = chapters.slice(i, i + BATCH_SIZE).map((c: any) => ({
        novel_id: Number(novelId),
        chapter_number: c.chapter_number,
        title: c.title,
        content: c.content,
      }));
      const { error } = await supabase.from('chapters').insert(batch);
      const nums = batch.map((b: any) => b.chapter_number).join('، ');
      if (error) {
        addLog(`فشل: ${nums} — ${error.message}`);
        failedCount += batch.length;
      } else {
        addLog(`تم: ${nums}`);
      }
      setProgress(i + batch.length);
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
    setRunning(false);
    addLog(failedCount ? `اكتمل مع ${failedCount} فشل` : 'اكتمل الرفع بنجاح ✅');
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', direction: 'rtl', maxWidth: 600, margin: '0 auto' }}>
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
