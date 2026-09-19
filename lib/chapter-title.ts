// عنوان الفصل من أول أسطر نص الـ PDF نفسه (أسماء الملفات فوضوية فما نستخدمها للعنوان).
// يفحص أول 4 أسطر بس. الأشكال المدعومة:
//   «الفصل 41 جروف طوكيو XI» / «الفصل 2 – النبوة»   → العنوان اللي بعد الرقم
//   «المجلد الأول – المقدمة:»                          → العنوان اللي بعد الشرطة
//   «المجلد :1 ملك اللاموتى» ثم سطر قصير «المقدمة»    → السطر القصير
// غير كذا يرجع null (فصل بدون عنوان).

const HEAD_CHARS = 1500;
const MAX_HEAD_LINES = 4;
const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g;
// pdf.js أحيانًا يقلب مكان الشرطة والرقم: «الفصل – 2 النبوة» بدل «الفصل 2 – النبوة» — نقبل الشكلين
const CHAPTER_LINE = /^الفصل\s*(?:[:：\-–—\u2010\u2011\u2212]\s*)*[0-9\u0660-\u0669]+\s*(.*)$/;
const VOLUME_LINE = /^(?:المجلد|الجزء|الكتاب|القسم)(?![\u0621-\u064A])/;
const VOLUME_DASH_TITLE = /^(?:المجلد|الجزء|الكتاب|القسم)[^–—\-:：]*[–—-]\s*(.+)$/;

function norm(line: string): string {
  return line.replace(BIDI, '').replace(/\s+/g, ' ').replace(/^[\s:：]+/, '').trim();
}

function clean(s: string): string {
  return s.replace(/^[\s\-–—:：.·•،,]+/, '').replace(/[\s\-–—:：.·•،,]+$/, '').trim();
}

// السطر اللي بعد «المجلد …»: قصير، مو جملة، وفيه حروف
function looksLikeTitle(s: string): boolean {
  return (
    s.length > 0 &&
    s.length <= 60 &&
    s.split(' ').length <= 10 &&
    /[A-Za-z\u0600-\u06FF]/.test(s) &&
    !/[.،,]$/.test(s)
  );
}

export function extractChapterTitle(text: string): string | null {
  const lines = text
    .slice(0, HEAD_CHARS)
    .split('\n')
    .map(norm)
    .filter(Boolean)
    .slice(0, MAX_HEAD_LINES);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 120) continue;

    const chapter = CHAPTER_LINE.exec(line);
    if (chapter) return clean(chapter[1]) || null;

    if (VOLUME_LINE.test(line)) {
      const next = lines[i + 1] ?? '';
      if (CHAPTER_LINE.test(next)) continue; // السطر الجاي «الفصل N …» وهو اللي يعطي العنوان
      const dash = VOLUME_DASH_TITLE.exec(line);
      if (dash) return clean(dash[1]) || null;
      if (looksLikeTitle(next)) return clean(next) || null;
    }
  }
  return null;
}

// رقم الفصل من اسم الملف: الرقم اللي بعد كلمة «الفصل».
// أول رقم بالاسم ممكن يكون رقم المجلد (المجلد_2_الفصل_15) فتاخذ كل فصول المجلد نفس الرقم.
export function parseChapterNumber(filename: string): number | null {
  const m = filename.match(/الفصل[\s_\-–—.:]*(\d+)/) ?? filename.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
