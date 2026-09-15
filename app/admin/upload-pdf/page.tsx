'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// يشغّل استخراج النص داخل المتصفح نفسه (مافي سيرفر معالجة) — يحتاج ملف الـ worker يترحّل مع الحزمة
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BATCH_SIZE = 5;
const DELAY_MS = 400;

// أي رابط بأول أو تاني سطر بس يتشال — الباقي ما يتفحص إطلاقًا
const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|me|co|xyz|top)\b/i;

type ParsedChapter = {
  novel_id: number;
  chapter_number: number;
  title: string | null;
  content: string;
};

function parseChapterNumber(filename: string): number | null {
  const m = filename.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function guessTitle(filename: string, num: number): string | null {
  const base = filename.replace(/\.pdf$/i, '');
  const withoutNum = base
    .replace(String(num), '')
    .replace(/^[\s_\-–—.]+|[\s_\-–—.]+$/g, '')
    .trim();
  return withoutNum.length > 0 ? withoutNum : null;
}

function stripLeadingLinkLines(text: string): string {
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(2, lines.length); i++) {
    if (URL_PATTERN.test(lines[i])) lines[i] = '';
  }
  return lines
    .filter((l, i) => !(i < 2 && l === ''))
    .join('\n')
    .replace(/^\n+/, '');
}

async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  try {
    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      let lastY: number | null = null;
      let line = '';
      const lines: string[] = [];
      for (const item of content.items as any[]) {
        if (typeof item.str !== 'string') continue; // يتجاهل أي عنصر مو نص (صور/رموز)
        const y = item.transform?.[5] ?? 0;
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          if (line.trim()) lines.push(line.trim());
          line = '';
        }
        line += item.str;
        lastY = y;
      }
      if (line.trim()) lines.push(line.trim());
      pageTexts.push(lines.join('\n'));
      page.cleanup();
    }
    return pageTexts.join('\n\n');
  } finally {
    // يحرر ذاكرة المتصفح فورًا بعد كل ملف — أهم خطوة لتفادي انهيار الصفحة مع مئات الملفات
    await pdf.destroy();
  }
}

export default function UploadPdfZipPage() {
  const [novelId, setNovelId] = useState('1');
  const [log, setLog] = useState<string[]>([]);
  const [stage, setStage] = useState<'idle' | 'working'>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const running = stage !== 'idle';

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function uploadBatch(batch: ParsedChapter[]) {
    const { error } = await supabase.from('chapters').insert(batch);
    const nums = batch.map((b) => b.chapter_number).join('، ');
    if (error) {
      addLog(`فشل رفع: ${nums} — ${error.message}`);
      return batch.length;
    }
    addLog(`تم رفع: ${nums}`);
    return 0;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLog([]);
    setProgress(0);

    // ١) فك ضغط الـ zip وجلب ملفات الـ PDF بس، وترتيبها برقم الفصل قبل البدء
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      addLog('خطأ: الملف مو zip صحيح');
      return;
    }
    const pdfEntries = Object.values(zip.files)
      .filter((f) => !f.dir && f.name.toLowerCase().endsWith('.pdf'))
      .map((f) => ({ entry: f, shortName: f.name.split('/').pop() || f.name }))
      .map((f) => ({ ...f, num: parseChapterNumber(f.shortName) }))
      .sort((a, b) => (a.num ?? 0) - (b.num ?? 0));

    if (pdfEntries.length === 0) {
      addLog('ما لقيت أي ملف PDF داخل الـ zip');
      return;
    }

    // ٢) استخراج + رفع كل ملف على حدة (مو كل الملفات أول ثم الرفع) —
    // عشان ما نحتفظ بمئات الفصول بالذاكرة بنفس الوقت، وهذا اللي كان يسبب توقف/انهيار الصفحة
    setStage('working');
    setTotal(pdfEntries.length);
    let failedCount = 0;
    let pendingBatch: ParsedChapter[] = [];

    for (let i = 0; i < pdfEntries.length; i++) {
      const { entry, shortName, num } = pdfEntries[i];
      if (num === null) {
        addLog(`تخطّي: ${shortName} — ما فيه رقم فصل بالاسم`);
        setProgress(i + 1);
        continue;
      }
      try {
        const buf = await entry.async('arraybuffer');
        const rawText = await extractPdfText(buf);
        const content = stripLeadingLinkLines(rawText).trim();
        if (!content) {
          addLog(`تحذير: الفصل ${num} (${shortName}) طلع بدون نص`);
        }
        pendingBatch.push({
          novel_id: Number(novelId),
          chapter_number: num,
          title: guessTitle(shortName, num),
          content,
        });
        addLog(`استخرجت: الفصل ${num} (${shortName})`);
      } catch (err: any) {
        addLog(`فشل استخراج: ${shortName} — ${err?.message || 'خطأ غير معروف'}`);
      }

      // يرفع كل ما توصل الدفعة للحجم المحدد، أو آخر ملف بالقائمة
      if (pendingBatch.length >= BATCH_SIZE || i === pdfEntries.length - 1) {
        if (pendingBatch.length > 0) {
          failedCount += await uploadBatch(pendingBatch);
          pendingBatch = []; // تفريغ فوري — يحرر الذاكرة قبل ما نكمل استخراج الدفعة الجاية
          await new Promise((r) => setTimeout(r, DELAY_MS));
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
      <a href="/admin/upload" style={{ display: 'inline-block', marginBottom: 16, fontSize: 13 }}>
        رفع فصول JSON (الطريقة القديمة) →
      </a>
      <h1>رفع فصول من ZIP يحتوي PDF</h1>
      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
        كل ملف PDF داخل الـ zip = فصل. رقم الفصل يُستخرج من اسم الملف (أول رقم موجود بالاسم).
        الصور والأيقونات تُتجاهل تلقائيًا، ويُستخرج النص فقط. أي رابط موجود بالسطر الأول أو
        الثاني من كل ملف يُحذف تلقائيًا.
      </p>
      <label>
        رقم الرواية (novel_id):{' '}
        <input value={novelId} onChange={(e) => setNovelId(e.target.value)} style={{ width: 60 }} />
      </label>
      <div style={{ marginTop: 16 }}>
        <input type="file" accept=".zip,application/zip" onChange={handleFile} disabled={running} />
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
