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

const HEAD_CHARS = 2500;
const MAX_HEAD_LINES = 6;
const MAX_LINE = 200;
const MAX_TITLE = 120;

const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g;
const SEPARATOR = /^[\s♦◆◇◊❖✦✧•*_=~·—–\-\u2500-\u257F\u25A0-\u25FF]{3,}$/;
const COVER = /^غلاف/;
const VOLUME = /^(?:المجلد|مجلد)(?![\u0621-\u064A])/;

// الفصل + (رقم | ترتيب بالحروف: الأول، الثاني، الخامس عشر …)
const ORDINAL =
  '(?:(?:الحادي|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع)\\s+عشر|(?:ال)?(?:أول|اول|ثاني|ثان|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|عشرون|ثلاثون))';
const LABEL_TAIL = new RegExp(
  `الفصل\\s*(?:[:：\\-–—\\u2010\\u2011\\u2212]\\s*)*(?:[0-9\\u0660-\\u0669]+|${ORDINAL}(?![\\u0621-\\u064A]))\\s*(.*)$`
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
  return repair(line.replace(BIDI, '').replace(/\s+/g, ' ').replace(/^[\s:：]+/, '').trim());
}

function clean(s: string): string {
  return s.replace(/^[\s\-–—:：.·•،,]+/, '').replace(/[\s\-–—:：.·•،,]+$/, '').trim();
}

// يرجع ما بعد «الفصل N» (ممكن فاضي)، أو null لو السطر ما فيه عنوان فصل.
// بالسطر العادي لازم يبدأ بها؛ بسطر المجلد ممكن تجي بعد اسم المجلد.
function chapterTail(line: string, isVolume: boolean): string | null {
  const m = LABEL_TAIL.exec(line);
  if (!m) return null;
  if (!isVolume && m.index !== 0) return null;
  if (isVolume && m.index > 0 && !/\s/.test(line[m.index - 1])) return null;
  const tail = clean(m[1]);
  // جملة من القصة تبدأ بكلمة «الفصل» مو عنوان
  if (tail.length > MAX_TITLE || /[.،,]$/.test(m[1].trim())) return null;
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
    const tail = chapterTail(line, isVolume);
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

// رقم الفصل من اسم الملف: الرقم اللي بعد كلمة «الفصل».
// أول رقم بالاسم ممكن يكون رقم المجلد (المجلد_2_الفصل_15) فتاخذ كل فصول المجلد نفس الرقم.
export function parseChapterNumber(filename: string): number | null {
  const m = filename.match(/الفصل[\s_\-–—.:]*(\d+)/) ?? filename.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
