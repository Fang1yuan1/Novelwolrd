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

// بعض مواقع الروايات (زي kolnovel) تصدّر PDF بخط عربي معطوب الترميز:
// حروف/تشكيل معينة تتحول لرموز خاصة (Private Use Area) بدل الحرف الحقيقي.
// هذا الجدول لكل رمز معروف السلوك الثابت (حرف واحد بس يقابله دايمًا):
const PUA_FIXED_MAP: Record<string, string> = {
  '\ue913': 'ى', // ألف مقصورة
  '\ue915': 'ي', // ياء
  '\ue940': 'ك', // كاف
  '\ue823': 'ً', // تنوين فتح
  '\ue824': 'ّ', // شدة
};
// \ue916 يمثل حالتين مختلفتين (ء و ئ) بنفس الرمز — لازم نحدده حسب الحرف قبله، مو استبدال ثابت
const HAMZA_GLYPH = '\ue916';

// القاعدة: همزة بعد حرف مد (ا و ي) تكتب غالبًا على السطر (ء)،
// وبعد حرف ساكن (أي حرف ثاني) تكتب غالبًا على ياء (ئ) — نفس قاعدة "شيء" مقابل "خاطئ"
function resolveHamzaGlyph(prevChar: string | undefined): string {
  if (prevChar && /[اوي]/.test(prevChar)) return 'ء';
  return 'ئ';
}

function fixPuaGlyphs(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === HAMZA_GLYPH) {
      out += resolveHamzaGlyph(out[out.length - 1]);
    } else if (ch in PUA_FIXED_MAP) {
      out += PUA_FIXED_MAP[ch];
    } else if (ch >= '\ue000' && ch <= '\uf8ff') {
      // رمز خاص غير معروف بهذا الخط — نتجاهله بدل ما يطلع مربع فاضي بالنص
    } else {
      out += ch;
    }
  }
  return out;
}

// يحذف NUL وبقية رموز التحكم غير المرئية — Postgres/Supabase يرفض النص لو فيه NUL (\u0000)،
// وهذا بالضبط سبب "فشل الرفع" (يطلع بشكل شائع بملفات PDF المصدّرة من بعض المواقع)
function stripControlChars(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

// بعض الرموز/الأيقونات بخطوط معطوبة تتحول لـ"نص سرجت" غير مكتمل (نص شق زوج بدون التاني) —
// Postgres يرفضه بنفس رسالة "unsupported Unicode escape sequence" تمامًا زي NUL،
// فلازم نحذف أي سرجت وحيد (مو مكتمل بزوج) بدون ما نلمس أي حرف عادي أو سرجت صحيح (زي الإيموجي)
function stripLoneSurrogates(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        out += text[i] + text[i + 1];
        i++;
      } // وإلا: سرجت عالي وحيد بدون شريك — يُحذف
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      // سرجت واطئ وحيد بدون سرجت عالي قبله — يُحذف
    } else {
      out += text[i];
    }
  }
  return out;
}

function sanitizeForDb(text: string): string {
  return stripLoneSurrogates(stripControlChars(text));
}

// عربي أساسي + أشكال العرض (Presentation Forms) — بعض الخطوط (زي خط هذا الملف) تخزن
// الحروف العربية برموز "أشكال العرض" بدل الحروف الأساسية، فلازم نغطي النطاقين مع بعض
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const NEUTRAL_CHAR = /[\s.,:;!؟،"'()\-\u060C\u061B\u061F]/;

// PDF بيخزن سطر عربي كامل بترتيب العرض البصري (زي ما يبان بالصفحة) مو ترتيب القراءة،
// فلازم نعكس ترتيب الحروف داخل كل "قطعة" عربية بس، ونسيب الأرقام/الروابط/الإنجليزي بترتيبها الصح
function fixArabicLineDirection(line: string): string {
  const arabicCount = (line.match(ARABIC_RANGE) || []).length;
  if (arabicCount < line.length * 0.3) return line; // سطر مو عربي أغلبه (رابط/عنوان إنجليزي) — ما نلمسه

  type Run = { text: string; rtl: boolean };
  const runs: Run[] = [];
  let current = '';
  let currentRtl: boolean | null = null;

  for (const ch of line) {
    const isNeutral = NEUTRAL_CHAR.test(ch);
    const isArabic = ARABIC_RANGE.test(ch);
    const rtl = isNeutral ? currentRtl ?? true : isArabic;
    if (currentRtl !== null && rtl !== currentRtl) {
      runs.push({ text: current, rtl: currentRtl });
      current = '';
    }
    currentRtl = rtl;
    current += ch;
  }
  if (current) runs.push({ text: current, rtl: currentRtl ?? true });

  return runs
    .reverse()
    .map((r) => (r.rtl ? [...r.text].reverse().join('') : r.text))
    .join('');
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
      // يرجّع ترتيب القراءة الصح للسطر العربي، ثم يصلح رموز الخط المعطوبة (بالترتيب المنطقي الصح)
      const fixedLines = lines.map((l) => fixPuaGlyphs(fixArabicLineDirection(l)));
      pageTexts.push(fixedLines.join('\n'));
      page.cleanup();
    }
    return sanitizeForDb(pageTexts.join('\n\n'));
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
    let error: any = null;
    let threw = false;
    try {
      const res = await supabase
        .from('chapters')
        .upsert(batch, { onConflict: 'novel_id,chapter_number' });
      error = res.error;
    } catch (err) {
      threw = true;
      error = err;
    }

    if (!error) {
      addLog(`تم رفع: ${batch.map((b) => b.chapter_number).join('، ')}`);
      return 0;
    }

    if (batch.length === 1) {
      // نطبع كل شي عن الخطأ بدون ما نفترض شكله (بعض الأخطاء تطلع Exception مو استجابة API عادية)
      const parts: string[] = [];
      if (error.message) parts.push(`message: ${error.message}`);
      if (error.details) parts.push(`details: ${error.details}`);
      if (error.hint) parts.push(`hint: ${error.hint}`);
      if (error.code) parts.push(`code: ${error.code}`);
      if (error.name) parts.push(`name: ${error.name}`);
      if (threw) parts.push('نوع: exception انرمى بالمتصفح (مو رد من Supabase)');
      let dump = '';
      try {
        dump = JSON.stringify(error, Object.getOwnPropertyNames(error));
      } catch {}
      addLog(`فشل رفع الفصل ${batch[0].chapter_number} — ${parts.join(' | ') || 'خطأ بدون رسالة'}`);
      if (dump && dump !== '{}') addLog(`تفاصيل خام: ${dump}`);
      return 1;
    }
    // الدفعة فشلت كوحدة — نعيد رفع كل فصل لحاله عشان نعزل الفصل المشكلة بالضبط
    // بدل ما نخسر الفصول السليمة الموجودة بنفس الدفعة
    let failed = 0;
    for (const chapter of batch) {
      failed += await uploadBatch([chapter]);
    }
    return failed;
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
        // تنظيف نهائي احتياطي على المحتوى والعنوان الاثنين — يضمن عدم وصول أي NUL
        // لقاعدة البيانات حتى لو مصدره اسم الملف نفسه مو نص الـ PDF
        const content = sanitizeForDb(stripLeadingLinkLines(rawText).trim());
        const rawTitle = guessTitle(shortName, num);
        const title = rawTitle ? sanitizeForDb(rawTitle) || null : null;
        if (!content) {
          addLog(`تحذير: الفصل ${num} (${shortName}) طلع بدون نص`);
        }
        pendingBatch.push({
          novel_id: Number(novelId),
          chapter_number: num,
          title,
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
