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
  }
  return pageTexts.join('\n\n');
}

export default function UploadPdfZipPage() {
  const [novelId, setNovelId] = useState('1');
  const [log, setLog] = useState<string[]>([]);
  const [stage, setStage] = useState<'idle' | 'extracting' | 'uploading'>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const running = stage !== 'idle';

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLog([]);
    setProgress(0);

    // ١) فك ضغط الـ zip وجلب ملفات الـ PDF بس
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      addLog('خطأ: الملف مو zip صحيح');
      return;
    }
    const pdfEntries = Object.values(zip.files).filter(
      (f) => !f.dir && f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfEntries.length === 0) {
      addLog('ما لقيت أي ملف PDF داخل الـ zip');
      return;
    }

    // ٢) استخراج النص من كل PDF
    setStage('extracting');
    setTotal(pdfEntries.length);
    const parsed: ParsedChapter[] = [];
    for (let i = 0; i < pdfEntries.length; i++) {
      const entry = pdfEntries[i];
      const shortName = entry.name.split('/').pop() || entry.name;
      const num = parseChapterNumber(shortName);
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
        parsed.push({
          novel_id: Number(novelId),
          chapter_number: num,
          title: guessTitle(shortName, num),
          content,
        });
        addLog(`استخرجت: الفصل ${num} (${shortName})`);
      } catch (err: any) {
        addLog(`فشل استخراج: ${shortName} — ${err?.message || 'خطأ غير معروف'}`);
      }
      setProgress(i + 1);
    }

    if (parsed.length === 0) {
      addLog('ما نجح استخراج أي فصل — توقفت العملية');
      setStage('idle');
      return;
    }

    parsed.sort((a, b) => a.chapter_number - b.chapter_number);

    // ٣) رفع الفصول المستخرجة لقاعدة البيانات (نفس منطق رفع الـ JSON الحالي)
    setStage('uploading');
    setTotal(parsed.length);
    setProgress(0);
    let failedCount = 0;
    for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
      const batch = parsed.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('chapters').insert(batch);
      const nums = batch.map((b) => b.chapter_number).join('، ');
      if (error) {
        addLog(`فشل رفع: ${nums} — ${error.message}`);
        failedCount += batch.length;
      } else {
        addLog(`تم رفع: ${nums}`);
      }
      setProgress(i + batch.length);
      await new Promise((r) => setTimeout(r, DELAY_MS));
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
            {stage === 'extracting' && 'استخراج النص: '}
            {stage === 'uploading' && 'الرفع لقاعدة البيانات: '}
            {progress} / {total}
          </div>
          <div style={{ background: '#333', height: 10, borderRadius: 5 }}>
            <div
              style={{
                background: stage === 'uploading' ? '#4f8cff' : '#a855f7',
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
