'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { decodeEscapedTitle, extractChapterTitle, resolveFilenames } from '@/lib/chapter-title';

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
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

// PDF بيعطينا كل سطر فعليًا بترتيب القراءة الصح (تأكدنا من هذا مباشرة بفحص مكتبة
// pdf.js نفسها على بيانات حقيقية) — العنصر الوحيد المعكوس فعليًا بمصدر هذا النوع
// من الملفات هو الأقواس نفسها (الفتح والإغلاق متبادلين بالمصدر)، فنصلحها بس
// بدون أي إعادة ترتيب لبقية الكلام — إعادة الترتيب اللي كنا نسويها قبل كانت
// هي اللي تخرب النص الصحيح أصلًا
const BRACKET_SWAP: Record<string, string> = {
  '(': ')', ')': '(',
  '[': ']', ']': '[',
};

function fixArabicLineDirection(line: string): string {
  const arabicCount = (line.match(ARABIC_RANGE) || []).length;
  if (arabicCount < line.length * 0.3) return line; // سطر مو عربي أغلبه (رابط/عنوان إنجليزي) — ما نلمسه
  return [...line].map((c) => BRACKET_SWAP[c] ?? c).join('');
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

// بعض الملفات فيها ذيل ثابت (دعوة تبرع/دعم مالي) يبدأ برمز ⏳ — أي شيء من هذا الرمز
// إلى آخر الفصل يُحذف بالكامل (السطر اللي فيه الرمز وكل اللي بعده)
function stripAfterHourglassMarker(text: string): string {
  const idx = text.indexOf('⏳');
  if (idx === -1) return text;
  const lineStart = text.lastIndexOf('\n', idx) + 1;
  return text.slice(0, lineStart).trimEnd();
}

type ParsedChapter = {
  novel_id: number;
  chapter_number: number;
  title: string | null;
  content: string;
};

// ملفات .txt (من سكربت السحب المباشر من صفحة الفصل) — نص نظيف جاهز، لا حاجة لأي
// إعادة بناء ترتيب حروف كما في PDF، فقط فك ترميز UTF-8
function extractTxtText(buf: ArrayBuffer): string {
  return new TextDecoder('utf-8').decode(buf);
}

async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  try {
    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      // نرتب العناصر أولًا حسب موقعها الفعلي بالصفحة (من فوق لتحت، ثم من يسار ليمين)
      // بدل ما نعتمد على ترتيبها جوا ملف الـ PDF نفسه — بعض ملفات PDF تخزن نصوصها
      // بترتيب داخلي غريب (مو بالضرورة من فوق لتحت)، وهذا اللي كان يسبب انتقال جمل
      // إنجليزية لمكان غلط بالفصل. ونحتفظ بارتفاع الخط الفعلي لكل عنصر (height)
      // عشان نستخدمه كمرجع مطلق لتمييز فاصل الفقرة الحقيقي عن مجرد لفّ سطر عادي
      const items = (content.items as any[])
        .filter((item) => typeof item.str === 'string')
        .map((item) => ({
          str: item.str as string,
          x: item.transform?.[4] ?? 0,
          y: item.transform?.[5] ?? 0,
          height: (item.height as number) || Math.abs(item.transform?.[3] ?? 0) || 10,
        }))
        .sort((a, b) =>
          Math.abs(a.y - b.y) > Math.max(a.height, b.height) * 0.4 ? b.y - a.y : b.x - a.x
        );

      // نجمع عناصر كل سطر بصري بالصفحة (زي قبل)، بس نحتفظ بموضع Y وارتفاع الخط لكل سطر.
      // ملاحظة مهمة: بعض الملفات فيها اختلاف بسيط بخط الأساس (baseline) بين الحروف
      // العربية والإنجليزية حتى لو كانوا فعليًا بنفس السطر المرئي (فرق فعلي شفناه: 2.2
      // نقطة بخط ارتفاعه 14) — فبدل حد ثابت "> 2" اللي كان يفصلهم غلط لسطرين منفصلين،
      // نخلي الحد نسبة من ارتفاع الخط نفسه، فيتسامح مع هذا الفرق الطبيعي
      type RawLine = { text: string; y: number; height: number };
      const rawLines: RawLine[] = [];
      let lastY: number | null = null;
      let lastHeight = 10;
      let line = '';
      let lineY: number | null = null;
      let lineHeight = 10;
      for (const item of items) {
        const sameLineThreshold = Math.max(lastHeight, item.height) * 0.4;
        if (lastY !== null && Math.abs(item.y - lastY) > sameLineThreshold) {
          if (line.trim()) rawLines.push({ text: line.trim(), y: lineY as number, height: lineHeight });
          line = '';
        }
        if (line === '') {
          lineY = item.y;
          lineHeight = item.height;
        }
        line += item.str;
        lastY = item.y;
        lastHeight = item.height;
      }
      if (line.trim()) rawLines.push({ text: line.trim(), y: lineY as number, height: lineHeight });

      // نصلح كل سطر (اتجاه + رموز الخط) بالترتيب المنطقي الصح أول شي
      const fixedRawLines = rawLines.map((rl) => ({
        text: fixPuaGlyphs(fixArabicLineDirection(rl.text.normalize('NFKC'))).replace(
          /\s{2,}/g,
          ' '
        ),
        y: rl.y,
        height: rl.height,
      }));

      // نقارن فجوة كل سطرين بارتفاع الخط الفعلي لهما (مرجع مطلق) — مو بمتوسط فجوات
      // الصفحة (مرجع نسبي). هذا مهم: بعض الملفات أسلوبها إن كل جملة فقرة لحالها
      // (فجوة كبيرة بين أغلب الأسطر)، فلو قارنا بمتوسط فجوات نفس الصفحة كان بيطلع
      // إن الفجوة "طبيعية" ويلصقها بالغلط. ارتفاع الخط نفسه مرجع ثابت ما يتغير
      // حسب أسلوب الملف، فيصير التمييز صح بأي ملف كان
      const paragraphs: string[] = [];
      let current = '';
      for (let i = 0; i < fixedRawLines.length; i++) {
        const { text, height } = fixedRawLines[i];
        if (i === 0) {
          current = text;
          continue;
        }
        const gap = Math.abs(fixedRawLines[i - 1].y - fixedRawLines[i].y);
        const refHeight = Math.max(fixedRawLines[i - 1].height, height, 1);
        const isNewParagraph = gap > refHeight * 1.6;
        if (isNewParagraph) {
          paragraphs.push(current);
          current = text;
        } else {
          current = current ? `${current} ${text}` : text;
        }
      }
      if (current) paragraphs.push(current);

      pageTexts.push(paragraphs.join('\n\n'));
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
    const listed = Object.values(zip.files)
      .filter((f) => !f.dir && (f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.txt')))
      .map((f) => ({ entry: f, shortName: f.name.split('/').pop() || f.name }))
      // ملفات ماك المخفية (__MACOSX/._اسم) مو ملفات حقيقية — تفشل وتبطّئ الرفع
      .filter((f) => !f.entry.name.startsWith('__MACOSX/') && !f.shortName.startsWith('._'));

    // الأرقام والعناوين من أسماء الملفات تُحل لكل الملفات مع بعض (تصحيح الأرقام المخرّبة
    // بالاعتماد على تسلسل بقية الفصول) — القواعد كلها بـ lib/chapter-title.ts
    const resolved = resolveFilenames(listed.map((f) => f.shortName));
    const pdfEntries = listed
      .map((f, i) => ({
        ...f,
        num: resolved[i].number,
        fileTitle: resolved[i].title,
        notes: resolved[i].notes,
      }))
      .sort((a, b) => (a.num ?? 0) - (b.num ?? 0));

    if (pdfEntries.length === 0) {
      addLog('ما لقيت أي ملف PDF أو TXT داخل الـ zip');
      return;
    }

    // نفس الرقم لأكثر من ملف = الفصول تُكتب فوق بعضها بالموقع (المفتاح: الرواية + رقم الفصل)
    const byNum = new Map<number, string[]>();
    for (const p of pdfEntries) {
      if (p.num !== null) byNum.set(p.num, [...(byNum.get(p.num) ?? []), p.shortName]);
    }
    const dupes = [...byNum].filter(([, names]) => names.length > 1);
    if (dupes.length > 0) {
      addLog(`تنبيه: ${dupes.length} رقم فصل مكرر — الفصلان بنفس الرقم يُكتب أحدهما فوق الآخر:`);
      for (const [n, names] of dupes.slice(0, 12)) {
        addLog(`  • الفصل ${n}: ${names.map((x) => x.replace(/\.pdf$/i, '').slice(-45)).join('  |  ')}`);
      }
    }

    // ملخص التسلسل + كل رقم صُحّح أو غير مؤكد (عشان تراجعه بدل ما تنتبه له بعد الرفع)
    const numbers = pdfEntries.map((p) => p.num).filter((n): n is number => n !== null);
    if (numbers.length > 0) {
      const have = new Set(numbers);
      const lo = Math.min(...numbers);
      const hiN = Math.max(...numbers);
      const missing: number[] = [];
      for (let n = lo; n <= hiN && missing.length < 200; n++) if (!have.has(n)) missing.push(n);
      addLog(
        `الفصول: ${pdfEntries.length} ملف، من ${lo} إلى ${hiN}` +
          (missing.length > 0
            ? `، أرقام ناقصة (${missing.length}): ${missing.slice(0, 15).join('، ')}${missing.length > 15 ? ' …' : ''}`
            : '')
      );
    }
    const noted = pdfEntries.filter((p) => p.notes.length > 0);
    if (noted.length > 0) {
      addLog(`ملاحظات على ${noted.length} ملف:`);
      for (const p of noted.slice(0, 15)) {
        addLog(`  • ${p.shortName.replace(/\.pdf$/i, '').slice(-40)} ← ${p.notes.join('؛ ')}`);
      }
    }

    // ٢) استخراج + رفع كل ملف على حدة (مو كل الملفات أول ثم الرفع) —
    // عشان ما نحتفظ بمئات الفصول بالذاكرة بنفس الوقت، وهذا اللي كان يسبب توقف/انهيار الصفحة
    setStage('working');
    setTotal(pdfEntries.length);
    let failedCount = 0;
    let pendingBatch: ParsedChapter[] = [];

    for (let i = 0; i < pdfEntries.length; i++) {
      const { entry, shortName, num, fileTitle } = pdfEntries[i];
      if (num === null) {
        addLog(`تخطّي: ${shortName} — ما فيه رقم فصل بالاسم`);
        setProgress(i + 1);
        continue;
      }
      try {
        const buf = await entry.async('arraybuffer');
        const isTxt = shortName.toLowerCase().endsWith('.txt');
        const rawText = isTxt ? extractTxtText(buf) : await extractPdfText(buf);
        // تنظيف نهائي احتياطي على المحتوى والعنوان الاثنين — يضمن عدم وصول أي NUL
        // لقاعدة البيانات. سطر الرابط وذيل التبرع خاصان بملفات الـ PDF القديمة فقط؛
        // تطبيقهما على .txt بلا ضرر (بلا تطابق = بلا تأثير)، فنسيب المنطق موحّدًا
        const content = sanitizeForDb(
          stripAfterHourglassMarker(stripLeadingLinkLines(rawText)).trim()
        );
        // العنوان من نص الـ PDF أولًا؛ وإذا النص ما فيه عنوان نقرأه من اسم الملف (بعد تنظيفه)
        const textTitle = extractChapterTitle(content, num);
        const rawTitle = textTitle ?? fileTitle;
        const title = rawTitle ? sanitizeForDb(decodeEscapedTitle(rawTitle)) || null : null;
        if (!content) {
          addLog(`تحذير: الفصل ${num} (${shortName}) طلع بدون نص`);
        }
        pendingBatch.push({
          novel_id: Number(novelId),
          chapter_number: num,
          title,
          content,
        });
        addLog(
          `استخرجت: الفصل ${num}${title ? ` — ${title}${textTitle ? '' : ' (من اسم الملف)'}` : ' — بدون عنوان'}`
        );
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
      <h1>رفع فصول من ZIP (PDF أو TXT)</h1>
      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
        كل ملف PDF أو TXT داخل الـ zip = فصل. رقم الفصل يُقرأ من اسم الملف ويُصحَّح تلقائيًا
        بحسب تسلسل بقية الملفات، وكل تصحيح يظهر في السجل. ملفات PDF: الصور والأيقونات
        تُتجاهل ويُستخرج النص فقط، وأي رابط بالسطر الأول أو الثاني من كل ملف يُحذف تلقائيًا.
        ملفات TXT: تُقرأ كما هي مباشرة بلا أي معالجة إضافية. عنوان الفصل يُستخرج من أول أسطر
        النص، وإذا لم يكن فيه عنوان يُقرأ من اسم الملف؛ الفصل الذي ليس له عنوان يُرفع برقمه فقط.
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
