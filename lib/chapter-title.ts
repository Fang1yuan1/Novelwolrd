// استخراج عنوان الفصل من أول أسطر نص الـ PDF نفسه — بدون أي اعتماد على اسم الملف
// (أسماء الملفات فوضوية: عنوان + تاريخ ملصوقين ببعض، فما نثق فيها).
//
// يُستدعى على النص بعد حذف سطور الرابط (stripLeadingLinkLines)، وبهذا الشكل:
// كل فقرة سطر مستقل، والفقرات مفصولة بسطر فاضي.
//
// الأشكال اللي يتعرف عليها (تأكدنا منها من عينات kolnovel):
//   ١) «الفصل 41 جروف طوكيو XI» أو «الفصل 2 – النبوة»  → العنوان = اللي بعد الرقم
//   ٢) «المجلد :1 ملك اللاموتى» ثم سطر قصير «المقدمة»   → العنوان = السطر اللي بعد المجلد
//   ٣) ما فيه شي من فوق → الفصل بدون عنوان (title = null) ويظهر بالموقع برقمه فقط

export type ExtractedChapterTitle = {
  title: string | null;
  // رقم الفصل لو كان مكتوبًا بسطر «الفصل N» — نستخدمه للمقارنة مع رقم اسم الملف فقط
  numberInText: number | null;
  // النص بعد حذف سطر العنوان (لأن الموقع يعرض العنوان لحاله بأعلى الفصل)
  content: string;
  source: 'chapter-line' | 'after-volume-line' | 'none';
};

// نفحص أول كم سطر فقط — بعدها أي شي يعتبر من القصة نفسها مو عنوان
const MAX_HEAD_LINES = 4;
// سطر أطول من هذا ما يكون عنوان (غالبًا فقرة من القصة لصقت بالغلط)
const MAX_HEADING_LENGTH = 120;
const MAX_TITLE_AFTER_VOLUME = 60;
const MAX_WORDS_AFTER_VOLUME = 10;

const BIDI_MARKS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g;
// «الفصل» + رقم (إنجليزي أو هندي) + أي شي بعده
const CHAPTER_LINE = /^الفصل\s*[:：]?\s*([0-9\u0660-\u0669]+)\s*(.*)$/;
// «المجلد / الجزء / الكتاب / القسم» كلمة كاملة بأول السطر
const VOLUME_LINE = /^(?:المجلد|الجزء|الكتاب|القسم)(?![\u0621-\u064A])/;
const HAS_LETTER = /[A-Za-z\u0600-\u06FF]/;

function normalizeLine(line: string): string {
  return line
    .replace(BIDI_MARKS, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s:：]+/, '')
    .trim();
}

function toNumber(digits: string): number {
  const ascii = digits.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  return parseInt(ascii, 10);
}

// يشيل الفواصل/الشرطات الزايدة من أطراف العنوان — يترك علامات مثل ؟ ! … لأنها جزء من العنوان
function cleanTitle(raw: string): string {
  return raw
    .replace(BIDI_MARKS, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–—:：.·•،,]+/, '')
    .replace(/[\s\-–—:：.·•،,]+$/, '')
    .trim();
}

// السطر اللي بعد «المجلد …»: قصير، مو جملة (ما ينتهي بنقطة/فاصلة)، وفيه حروف
function looksLikeTitleAfterVolume(line: string): boolean {
  if (!line || line.length > MAX_TITLE_AFTER_VOLUME) return false;
  if (!HAS_LETTER.test(line)) return false;
  if (/[.،,]$/.test(line)) return false;
  if (line.split(' ').length > MAX_WORDS_AFTER_VOLUME) return false;
  return true;
}

export function extractChapterTitle(
  content: string,
  options: { removeTitleLine?: boolean } = {}
): ExtractedChapterTitle {
  const removeTitleLine = options.removeTitleLine ?? true;
  const lines = content.split('\n');

  // فهارس أول أسطر غير فاضية
  const head: number[] = [];
  for (let i = 0; i < lines.length && head.length < MAX_HEAD_LINES; i++) {
    if (lines[i].trim()) head.push(i);
  }

  const finish = (
    idx: number,
    title: string | null,
    numberInText: number | null,
    source: ExtractedChapterTitle['source']
  ): ExtractedChapterTitle => {
    let out = content;
    if (removeTitleLine) {
      const copy = [...lines];
      copy.splice(idx, 1);
      // نشيل الفاصل الفاضي اللي بعد السطر المحذوف عشان ما يبقى فراغ زايد
      if (idx < copy.length && copy[idx].trim() === '') copy.splice(idx, 1);
      out = copy.join('\n').replace(/^\s+/, '');
    }
    return { title, numberInText, content: out, source };
  };

  for (let k = 0; k < head.length; k++) {
    const idx = head[k];
    const line = normalizeLine(lines[idx]);
    if (!line || line.length > MAX_HEADING_LENGTH) continue;

    const chapter = CHAPTER_LINE.exec(line);
    if (chapter) {
      const title = cleanTitle(chapter[2]);
      return finish(idx, title || null, toNumber(chapter[1]), 'chapter-line');
    }

    if (VOLUME_LINE.test(line) && k + 1 < head.length) {
      const nextIdx = head[k + 1];
      const next = normalizeLine(lines[nextIdx]);
      // لو اللي بعد المجلد سطر «الفصل N …» تمسكه الدورة الجاية بالقاعدة الأولى
      if (!CHAPTER_LINE.test(next) && looksLikeTitleAfterVolume(next)) {
        return finish(nextIdx, cleanTitle(next), null, 'after-volume-line');
      }
    }
  }

  return { title: null, numberInText: null, content, source: 'none' };
}
