'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import {
  resolveFilenames,
  extractChapterTitle,
  extractEmbeddedChapterNumber,
} from '@/lib/chapter-title';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BATCH_SIZE = 5;
const DELAY_MS = 400;

// يشيل NUL وبقية رموز التحكم غير المرئية اللي يرفضها Postgres/Supabase
function sanitizeForDb(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

type Entry = { entry: JSZip.JSZipObject; shortName: string };
type Ready = { shortName: string; num: number; getContent: () => Promise<string>; filenameTitle: string | null };

export default function UploadTxtPage() {
  const [novelId, setNovelId] = useState('1');
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [stage, setStage] = useState<'idle' | 'working'>('idle');

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function uploadBatch(batch: { novel_id: number; chapter_number: number; title: string | null; content: string }[]) {
    const { error } = await supabase.from('chapters').insert(batch);
    const nums = batch.map((b) => b.chapter_number).join('، ');
    if (error) {
      addLog(`فشل: ${nums} — ${error.message}`);
      return batch.length;
    }
    addLog(`تم: ${nums}`);
    return 0;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLog([]);
    setProgress(0);

    // ١) فك الضغط + جلب ملفات txt بس (تجاهل زبالة الماك)
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      addLog('خطأ: الملف مو zip صحيح');
      return;
    }
    const listed: Entry[] = Object.values(zip.files)
      .filter((f) => !f.dir && f.name.toLowerCase().endsWith('.txt'))
      .map((f) => ({ entry: f, shortName: f.name.split('/').pop() || f.name }))
      .filter((f) => !f.entry.name.startsWith('__MACOSX/') && !f.shortName.startsWith('._'));

    if (listed.length === 0) {
      addLog('ما لقيت أي ملف .txt داخل الـ zip');
      return;
    }

    // ٢) نفرز أول شي نسخ الملفات المكررة من نفس الفصل (لاحقة "(2)" تجيها من إعادة تنزيل
    // فاشل بالسكربت) — هذي ما نعتمد فيها على اسم الملف إطلاقًا، لازم نفتح محتواها
    const dupBase = (name: string) => name.replace(/\.txt$/i, '').replace(/\s*\(\d+\)\s*$/, '');
    const groups = new Map<string, Entry[]>();
    for (const f of listed) {
      const key = dupBase(f.shortName);
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(f);
    }

    const ready: Ready[] = [];
    const skipped: string[] = [];

    const normalEntries = [...groups.values()].filter((g) => g.length === 1).map((g) => g[0]);
    const dupGroups = [...groups.values()].filter((g) => g.length > 1);

    for (const group of dupGroups) {
      const withContent = await Promise.all(
        group.map(async (f) => ({ f, text: sanitizeForDb((await f.entry.async('string')).trim()) }))
      );
      const seen = new Set<string>();
      const unique = withContent.filter(({ text }) => {
        const key = text.slice(0, 500);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (unique.length === 1) {
        addLog(`ملاحظة: ${group.length} ملفات بنفس الاسم كانت نسخة مكررة لنفس المحتوى — أخذت وحدة (${unique[0].f.shortName}).`);
        const num = extractEmbeddedChapterNumber(unique[0].text);
        if (num !== null) {
          ready.push({ shortName: unique[0].f.shortName, num, getContent: async () => unique[0].text, filenameTitle: null });
        } else {
          skipped.push(unique[0].f.shortName);
          addLog(`تخطّي: ${unique[0].f.shortName} — نسخة وحيدة بلا رقم واضح داخل النص، راجعه يدويًا`);
        }
        continue;
      }
      const withNum = unique.map((u) => ({ ...u, num: extractEmbeddedChapterNumber(u.text) }));
      const distinct = new Set(withNum.map((u) => u.num).filter((n) => n !== null));
      if (withNum.every((u) => u.num !== null) && distinct.size === withNum.length) {
        for (const u of withNum) {
          ready.push({ shortName: u.f.shortName, num: u.num!, getContent: async () => u.text, filenameTitle: null });
        }
        addLog(
          `صححت تعارض على "${group[0].shortName.replace(/\.txt$/i, '')}": فرزتهم حسب الرقم المكتوب داخل كل ملف (${withNum
            .map((u) => u.num)
            .join('، ')}).`
        );
      } else {
        for (const u of withNum) skipped.push(u.f.shortName);
        addLog(
          `تعارض غير محلول (${unique.length} ملفات مختلفة المحتوى بنفس الاسم، بلا رقم واضح بكل واحد) — تخطّيتهم، راجعهم يدويًا: ${unique
            .map((u) => u.f.shortName)
            .join('  |  ')}`
        );
      }
    }

    // ٣) بقية الملفات (العادية، بلا تعارض اسم) — نمرّرهم كلهم مع بعض على القانون
    // المشترك (نفس اللي يستخدمه رفع PDF): يستنتج الرقم بحسب تسلسل بقية الملفات،
    // ويصحح الأصفار الزايدة والأرقام الملصوقة، ويرقّم كل مجلد تسلسليًا لو احتاج
    const resolved = resolveFilenames(normalEntries.map((f) => f.shortName));
    for (let i = 0; i < normalEntries.length; i++) {
      const f = normalEntries[i];
      const r = resolved[i];
      if (r.number === null) {
        skipped.push(f.shortName);
        addLog(`تخطّي: ${f.shortName} — ما فيه رقم فصل واضح بالاسم`);
        continue;
      }
      for (const n of r.notes) addLog(`ملاحظة: ${f.shortName} — ${n}`);
      ready.push({
        shortName: f.shortName,
        num: r.number,
        getContent: async () => sanitizeForDb((await f.entry.async('string')).trim()),
        filenameTitle: r.title,
      });
    }

    // ٤) رقم متكرر بين المجموعتين مع بعض (نادر، لكن ممكن) — تنبيه بس بدون رفض
    const byNum = new Map<number, string[]>();
    for (const r of ready) byNum.set(r.num, [...(byNum.get(r.num) ?? []), r.shortName]);
    for (const [n, names] of byNum) {
      if (names.length > 1) {
        addLog(`تنبيه: رقم الفصل ${n} تكرر بأكثر من ملف: ${names.join('  |  ')} — الفصلان بيُكتب أحدهما فوق الآخر`);
      }
    }

    ready.sort((a, b) => a.num - b.num);

    if (ready.length > 0) {
      const nums = ready.map((r) => r.num);
      const lo = Math.min(...nums);
      const hi = Math.max(...nums);
      const have = new Set(nums);
      const missing: number[] = [];
      for (let n = lo; n <= hi && missing.length < 200; n++) if (!have.has(n)) missing.push(n);
      addLog(
        `الفصول: ${ready.length} ملف، من ${lo} إلى ${hi}` +
          (missing.length > 0 ? `، أرقام ناقصة (${missing.length}): ${missing.slice(0, 15).join('، ')}${missing.length > 15 ? ' …' : ''}` : '')
      );
    }
    if (skipped.length > 0) addLog(`إجمالي المتخطّى: ${skipped.length} ملف`);

    // ٥) الاستخراج + الرفع تدريجيًا (ملف ملف، مو الكل بالذاكرة مرة وحدة)
    setStage('working');
    setTotal(ready.length);
    let failedCount = 0;
    let pendingBatch: { novel_id: number; chapter_number: number; title: string | null; content: string }[] = [];

    for (let i = 0; i < ready.length; i++) {
      const r = ready[i];
      try {
        const content = await r.getContent();
        const textTitle = extractChapterTitle(content, r.num);
        const title = textTitle ?? r.filenameTitle ?? null;
        if (!content) addLog(`تحذير: الفصل ${r.num} (${r.shortName}) طلع بدون نص`);
        pendingBatch.push({ novel_id: Number(novelId), chapter_number: r.num, title, content });
      } catch (err: any) {
        addLog(`فشل استخراج: ${r.shortName} — ${err?.message || 'خطأ غير معروف'}`);
      }
      if (pendingBatch.length >= BATCH_SIZE || i === ready.length - 1) {
        if (pendingBatch.length > 0) {
          failedCount += await uploadBatch(pendingBatch);
          pendingBatch = [];
          await new Promise((r2) => setTimeout(r2, DELAY_MS));
        }
      }
      setProgress(i + 1);
    }

    setStage('idle');
    addLog(failedCount ? `اكتمل مع ${failedCount} فشل` : 'اكتمل الرفع بنجاح ✅');
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', direction: 'rtl', maxWidth: 600, margin: '0 auto' }}>
      <a href="/admin" style={{ display: 'inline-block', marginBottom: 8, fontSize: 13 }}>
        ← لوحة التحكم
      </a>
      <br />
      <a href="/admin/upload-pdf" style={{ display: 'inline-block', marginBottom: 16, fontSize: 13 }}>
        رفع فصول PDF (ZIP) →
      </a>
      <h1>رفع فصول TXT (ZIP)</h1>
      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
        ارفع ملف zip واحد فيه كل ملفات .txt للرواية (آلاف الملفات مافيها مشكلة). رقم كل فصل يُستنتج
        من تسلسل أسماء كل الملفات مع بعض (يصحح الأصفار الزايدة والأرقام الملصوقة، ويرقّم كل مجلد
        تسلسليًا لو الترقيم يبدأ من 1 بكل مجلد). العنوان من داخل نص الفصل أولًا، وإلا من اسم الملف،
        وإلا بلا عنوان. أي ملفين بنفس الاسم (نسخة معادة تنزيلها) يتفرزون حسب الرقم المكتوب داخل كل
        واحد؛ وأي تعارض ما ينحل تلقائيًا يُتخطّى ويظهر بالسجل تحت عشان تراجعه يدويًا.
      </p>
      <label>
        رقم الرواية (novel_id):{' '}
        <input value={novelId} onChange={(e) => setNovelId(e.target.value)} style={{ width: 60 }} />
      </label>
      <div style={{ marginTop: 16 }}>
        <input type="file" accept=".zip,application/zip" onChange={handleFile} disabled={stage === 'working'} />
      </div>
      {total > 0 && (
        <div style={{ marginTop: 16 }}>
          <div>
            {stage === 'working' && 'جارٍ الاستخراج والرفع: '}
            {progress} / {total}
          </div>
          <div style={{ background: '#333', height: 10, borderRadius: 5 }}>
            <div
              style={{
                background: '#4f8cff',
                height: '100%',
                width: `${(progress / total) * 100}%`,
                borderRadius: 5,
                transition: 'width 150ms',
              }}
            />
          </div>
        </div>
      )}
      <div
        style={{
          marginTop: 16,
          background: '#111',
          color: '#8f8',
          padding: 10,
          maxHeight: 400,
          overflowY: 'auto',
          fontSize: 12,
          direction: 'ltr',
          textAlign: 'left',
        }}
      >
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
