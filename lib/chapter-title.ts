// عنوان الفصل من أول أسطر نص الـ PDF نفسه (أسماء الملفات فوضوية فما نستخدمها للعنوان).
//
// الفكرة: لا نخمّن أن أي سطر قصير عنوان (هذا كان يلقط جملة من القصة). نقبل بس
// الأشكال البنيوية اللي شفناها بملفات kolnovel، ونتجاوز الأسطر اللي ما هي عنوان:
//   فواصل  «♦ ♦ ♦» / «–———»        وأغلفة «غلاف المجلد …» / «غلاف الفصل الأول:»
// الأشكال المقبولة (والعنوان = اللي بعد رقم/ترتيب الفصل):
//   «الفصل 41 جروف طوكيو XI» · «الفصل – 2 النبوة» · «الفصل الخامس: موت آينز»
//   «المجلد 5: اسم المجلد الفصل – 1 الجزء الثالث – قلب الشاب»  (كله بسطر واحد)
//   «المجلد 5: اسم المجلد» ثم سطر «الفصل – 5 الجزء الثالث – …»
//   «المجلد 1: اسم المجلد» ثم «المقدمة» / «الخاتمة» / «فاصل»
//   «المجلد الأول – المقدمة:» · «المجلد 2: اسم المجلد المقدمة»
//   سطر قصير يليه سطر فواصل: «فصل الإستراحة» / «الخاتمة» / «مقدمة – الجزء الأول»
// غير كذا يرجع null (فصل بدون عنوان) — أفضل من عنوان غلط.

const HEAD_CHARS = 3000;
const MAX_HEAD_LINES = 10;
const MAX_LINE = 200;
const MAX_TITLE = 120;
const HAS_LETTER = /[A-Za-z\u0600-\u06FF]/;
const MAX_TITLE_WORDS = 14;
const MAX_WORDS_WITH_PERIOD = 6;

const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g;
const SEPARATOR = /^[\s♦◆◇◊❖✦✧•*_=~·—–\-\u2500-\u257F\u25A0-\u25FF\u2700-\u27BF]{3,}$/;
const COVER = /^غلاف/;
const VOLUME = /^(?:المجلد|مجلد)(?![\u0621-\u064A])/;

// الفصل + (رقم | ترتيب بالحروف: الأول، الثاني، الخامس عشر …)
const ORDINAL =
  '(?:(?:الحادي|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع)\\s+عشر|(?:ال)?(?:أول|اول|ثاني|ثان|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|عشرون|ثلاثون))';
const LABEL_TAIL = new RegExp(
  `الفصل\\s*(?:[:：\\-–—\\u2010\\u2011\\u2212“”"«»‘’]\\s*)*(?:[0-9\\u0660-\\u0669]+|${ORDINAL}(?![\\u0621-\\u064A]))\\s*(.*)$`
);
const TRAILING_KEYWORD = /(?:^|\s)((?:ال)?(?:مقدمة|خاتمة|فاصل)|(?:جزء|فصل)\s+إضافي)\s*[:：]?$/;
const KEYWORD =
  /^(?:(?:ال)?(?:مقدمة|خاتمة|فاصل|تمهيد|ملحق|خلاصة)|(?:فصل|جزء)\s+(?:ال)?(?:إستراحة|استراحة|إضافي|اضافي))(?:\s|$)/;

// pdf.js يخرّب بعض الأسطر العربية: «الثان– ي» بدل «الثاني –»، وفراغ قبل التشكيل «الق َّتلة»
function repair(s: string): string {
  return s
    .replace(/([\u0621-\u064A])\s*[–-]\s*ي(?=\s|$)/g, '$1ي –')
    .replace(/\s+([\u064B-\u065F])/g, '$1');
}

function normalize(line: string): string {
  return repair(
    line
      .replace(BIDI, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s:：\u064B-\u065F\u0670]+/, '')
      .trim()
  );
}

function clean(s: string): string {
  return s
    .replace(/^[\s\-–—:：.·•،,“”"«»‘’]+/, '')
    .replace(/[\s\-–—:：.·•،,“”"«»‘’]+$/, '')
    .trim();
}

// يرجع ما بعد «الفصل N» (ممكن فاضي)، أو null لو السطر ما فيه عنوان فصل.
// بالسطر العادي لازم يبدأ بها؛ بسطر المجلد ممكن تجي بعد اسم المجلد.
function chapterTail(line: string, isVolume: boolean, afterSeparator: boolean): string | null {
  const m = LABEL_TAIL.exec(line);
  if (!m) return null;
  if (!isVolume && m.index !== 0) return null;
  if (isVolume && m.index > 0 && !/\s/.test(line[m.index - 1])) return null;
  const tail = clean(m[1]);
  // جملة من القصة تبدأ بكلمة «الفصل» مو عنوان
  // عنوان قد ينتهي بنقطة («ليمدد الدم حكمه.») لكن بجملة طويلة تنتهي بنقطة = فقرة من القصة
  const words = tail.split(' ').length;
  const sentenceLike =
    !afterSeparator && /[.،,]$/.test(m[1].trim()) && words > MAX_WORDS_WITH_PERIOD;
  if (tail.length > MAX_TITLE || words > MAX_TITLE_WORDS || sentenceLike) return null;
  return tail;
}

export function extractChapterTitle(text: string): string | null {
  const lines = text
    .slice(0, HEAD_CHARS)
    .split('\n')
    .map(normalize)
    .filter(Boolean)
    .slice(0, MAX_HEAD_LINES);

  let sawBody = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SEPARATOR.test(line) || COVER.test(line)) continue;
    if (line.length > MAX_LINE) {
      sawBody = true;
      continue;
    }

    const isVolume = VOLUME.test(line);
    const tail = chapterTail(line, isVolume, i > 0 && SEPARATOR.test(lines[i - 1]));
    if (tail !== null) return tail || null;

    if (isVolume) {
      const keyword = TRAILING_KEYWORD.exec(line);
      if (keyword) return keyword[1];
      continue; // سطر مجلد فقط — العنوان بالسطر اللي بعده
    }

    if (!sawBody) {
      const next = lines[i + 1];
      const beforeSeparator =
        next !== undefined && SEPARATOR.test(next) && line.length <= 80 && line.split(' ').length <= 8;
      if (KEYWORD.test(line) || beforeSeparator) return clean(line) || null;
    }
    sawBody = true;
  }
  return null;
}

// ───────────── اسم الملف ─────────────
// الموقع يسمّي الملف: «المجلد 4 اسم المجلد الفصل 228 العنوان يوليو 24, 2026.pdf»
// والعنوان والتاريخ ملصوقين، وأحيانًا:
//   «الفصل 0⁨الفصل 228 …⁩»   ← «الفصل 0» وهمي قبل الرقم الحقيقي
//   «الفصل 247247»            ← فصل بدون عنوان: الموقع يكرر الرقم
//   «الفصل 5.5العنوان»        ← فصل فرعي (رقمه عشري)
const MONTHS = 'يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر';
const DATE_SUFFIX = new RegExp(`\\s*(?:${MONTHS})\\s*\\d{1,2}\\s*,?\\s*\\d{4}\\s*$`);
const FILE_CHAPTER = /الفصل[\s\-–—.:]*(\d+)/g;

// ما بعد «الفصل N» الحقيقي بالاسم (بدون التاريخ)، أو null لو ما فيه
function locateChapterInFilename(filename: string): { number: number; rest: string } | null {
  const name = filename
    .replace(BIDI, '')
    .normalize('NFC')
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .replace(DATE_SUFFIX, '');
  for (const m of name.matchAll(FILE_CHAPTER)) {
    let digits = m[1];
    let rest = name.slice((m.index ?? 0) + m[0].length);
    if (parseInt(digits, 10) === 0) continue; // «الفصل 0» الوهمي
    const half = digits.length / 2;
    if (Number.isInteger(half) && digits.slice(0, half) === digits.slice(half) && rest.trim() === '') {
      digits = digits.slice(0, half); // «247247» = فصل 247 بدون عنوان
    }
    return { number: parseInt(digits, 10), rest };
  }
  return null;
}

// رقم الفصل من اسم الملف. أول رقم بالاسم ممكن يكون رقم المجلد أو 0 وهمي،
// فناخذ الرقم اللي بعد كلمة «الفصل».
export function parseChapterNumber(filename: string): number | null {
  const found = locateChapterInFilename(filename);
  if (found) return found.number;
  const m = filename.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// عنوان احتياطي من اسم الملف — يُستعمل فقط لما نص الـ PDF ما فيه عنوان.
// يرجع null لو الفصل بدون عنوان (مثل «الفصل 247247»).
export function titleFromFilename(filename: string): string | null {
  const found = locateChapterInFilename(filename);
  if (!found) return null;
  const title = clean(
    found.rest
      .replace(/^\.\d+/, '') // «5.5» فصل فرعي
      .replace(new RegExp(`^\\s*الفصل\\s*(?:[0-9\\u0660-\\u0669]+|${ORDINAL})\\s*[-–—:]?`), '') // «الفصل 3 -الجزء الأول»
  );
  return HAS_LETTER.test(title) ? title : null;
}
