// قانون واحد لأرقام الفصول وعناوينها — يُستعمل من صفحة رفع الـ PDF (admin/upload-pdf).
//
// ١) عنوان الفصل: من أول أسطر نص الـ PDF (extractChapterTitle)، وإذا النص ما فيه عنوان
//    نقرأه من اسم الملف (resolveFilenames) بعد تنظيفه وتجاهل العناوين الوهمية.
// ٢) رقم الفصل: من اسم الملف، مع تصحيح الحالات اللي يخرّب فيها الموقع الرقم
//    (الرقم مكرر، أصفار زايدة، أرقام ملصوقة بالعنوان، …) بالاعتماد على تسلسل بقية الفصول.
//
// كل قاعدة هنا لها اختبار بالمشروع؛ وأي قرار غير مؤكد يرجع ضمن notes ليُعرض بالسجل.

// ════════════════════════ عنوان الفصل من النص ════════════════════════
//
// لا نخمّن أن أي سطر قصير عنوان (هذا كان يلقط جملة من القصة). نقبل بس الأشكال البنيوية،
// ونتجاوز الفواصل («♦ ♦ ♦» «▬▬▬ ❃ ◈ ❃ ▬▬▬») والأغلفة («غلاف المجلد …»):
//   «الفصل 41 جروف طوكيو XI» · «الفصل – 2 النبوة» · «الفصل الخامس: موت آينز» · «Chapter 5 – Title»
//   «الفصل – 489 489. الاستعمار» (الرقم مكرر) · «1093. سيف سين» (رقم ونقطة بلا كلمة الفصل)
//   «الفصل 29» لحاله ثم سطر العنوان ثم فاصل «~*~»
//   «المجلد 5: اسم المجلد الفصل – 1 الجزء الثالث – قلب الشاب» (كله بسطر واحد)
//   «المجلد 1: اسم المجلد» ثم «المقدمة» / «الخاتمة» / «فاصل»
//   سطر قصير يليه سطر فواصل: «فصل الإستراحة» / «الخاتمة»
// غير كذا يرجع null (فصل بدون عنوان) — أفضل من عنوان غلط.

const HEAD_CHARS = 3000;
const MAX_HEAD_LINES = 10;
const MAX_LINE = 200;
const MAX_TITLE = 120;
const MAX_TITLE_WORDS = 14;
const MAX_WORDS_WITH_PERIOD = 6;
const MAX_NUMERIC_HEADING_WORDS = 9;
const MAX_TITLE_AFTER_LABEL_WORDS = 10;
const HAS_LETTER = /[A-Za-z\u0600-\u06FF]/;

const BIDI = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\u061c]/g;
const SEPARATOR = /^[\s♦◆◇◊❖✦✧•*_=~·—–\-\u2500-\u257F\u25A0-\u25FF\u2700-\u27BF]{3,}$/;
const COVER = /^غلاف/;
const VOLUME = /^(?:المجلد|مجلد)(?![\u0621-\u064A])/;

const ORDINAL =
  '(?:(?:الحادي|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع)\\s+عشر|(?:ال)?(?:أول|اول|ثاني|ثان|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع|عاشر|عشرون|ثلاثون))';
const LABEL_WORD = '(?:الفصل|فصل|الحلقة|الحلقه|Chapter|Ch\\.?)';
// [1] رقم أو ترتيب بالحروف  [2] ما بعده
const LABEL_TAIL = new RegExp(
  `${LABEL_WORD}\\s*(?:[:：\\-–—\\u2010\\u2011\\u2212“”"«»‘’]\\s*)*([0-9\\u0660-\\u0669]+|${ORDINAL}(?![\\u0621-\\u064A]))\\s*(.*)$`,
  'i'
);
const NUMERIC_HEADING = /^(\d{1,5})\s*[.\-–—:)]\s*(.+)$/;
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

const EDGE = '\\s\\-–—:：.·•،,“”"«»‘’';
function clean(s: string): string {
  return s
    .replace(new RegExp(`^[${EDGE}]+`), '')
    .replace(new RegExp(`[${EDGE}]+$`), '')
    .trim();
}

function toAsciiDigits(s: string): string {
  return s.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

// عنوان قد ينتهي بنقطة («ليمدد الدم حكمه.») لكن جملة طويلة تنتهي بنقطة = فقرة من القصة
function plausibleTitle(raw: string, title: string, trusted: boolean): boolean {
  if (!title || !HAS_LETTER.test(title)) return false;
  const words = title.split(' ').length;
  const sentenceLike = !trusted && /[.،,]$/.test(raw.trim()) && words > MAX_WORDS_WITH_PERIOD;
  return title.length <= MAX_TITLE && words <= MAX_TITLE_WORDS && !sentenceLike;
}

// «الفصل N …» → ما بعد الرقم (ممكن فاضي)، أو null لو السطر ما فيه عنوان فصل.
// بالسطر العادي لازم يبدأ بها؛ بسطر المجلد ممكن تجي بعد اسم المجلد.
function chapterTail(line: string, isVolume: boolean, afterSeparator: boolean): string | null {
  const m = LABEL_TAIL.exec(line);
  if (!m) return null;
  if (!isVolume && m.index !== 0) return null;
  if (isVolume && m.index > 0 && !/\s/.test(line[m.index - 1])) return null;
  let tail = m[2];
  // الموقع يكرر رقم الفصل بأول العنوان: «الفصل – 489 489. الاستعمار»
  const digits = toAsciiDigits(m[1]);
  if (/^\d+$/.test(digits)) {
    tail = tail.replace(new RegExp(`^${digits}(?!\\d)\\s*[.\\-–—:)]?\\s*`), '');
  }
  const title = clean(tail);
  if (title && !plausibleTitle(tail, title, afterSeparator)) return null;
  return title;
}

export function extractChapterTitle(text: string, expectedNumber?: number | null): string | null {
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

    const afterSeparator = i > 0 && SEPARATOR.test(lines[i - 1]);
    const isVolume = VOLUME.test(line);
    const tail = chapterTail(line, isVolume, afterSeparator);
    if (tail) return tail;
    if (tail === '') {
      // «الفصل 29» لحاله ثم العنوان بالسطر اللي بعده وبعده فاصل («~*~» / «***»):
      // الفاصل هو اللي يثبت إنه عنوان مو أول جملة من القصة
      const next = lines[i + 1];
      const after = lines[i + 2];
      if (
        next !== undefined &&
        after !== undefined &&
        SEPARATOR.test(after) &&
        !SEPARATOR.test(next) &&
        !COVER.test(next) &&
        next.length <= 80 &&
        next.split(' ').length <= MAX_TITLE_AFTER_LABEL_WORDS
      ) {
        return clean(next) || null;
      }
      return null;
    }

    if (isVolume) {
      const keyword = TRAILING_KEYWORD.exec(line);
      if (keyword) return keyword[1];
      continue; // سطر مجلد فقط — العنوان بالسطر اللي بعده
    }

    if (!sawBody || afterSeparator) {
      const numeric = NUMERIC_HEADING.exec(line);
      if (numeric && (expectedNumber == null || parseInt(numeric[1], 10) === expectedNumber)) {
        const title = clean(numeric[2]);
        if (plausibleTitle(numeric[2], title, false) && title.split(' ').length <= MAX_NUMERIC_HEADING_WORDS) {
          return title;
        }
      }
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

// ════════════════════════ اسم الملف: الرقم + العنوان ════════════════════════
//
// الموقع يسمّي الملف: «[أخر فصل]المجلد 4 اسم المجلد الفصل 228 العنوان يوليو 24, 2026.pdf»
// والعنوان والتاريخ ملصوقين، وهذي كل الحالات اللي شفناها (وتُختبر):
//   «الفصل 0⁨الفصل 228 …⁩»            «الفصل 0» وهمي قبل الرقم الحقيقي
//   «الفصل 247247»                     فصل بدون عنوان: الموقع يكرر الرقم
//   «الفصل 410410.docx»                الرقم مكرر + اسم ملف Word بدل العنوان
//   «الفصل 0451 451.docx»              صفر بادئ + رقم مكرر + .docx
//   «الفصل 161161- وريث»               الرقم مكرر ثم العنوان
//   «الفصل 1150ولادة&السيف-kol 1150»   عنوان وهمي مكرر بكل الفصول (اسم الرواية)
//   «الفصل 10324» / «الفصل 3390»       الرقم ملصوق بأرقام زايدة (10 + 324، 339 + 0)
//   «الفصل 5.5العنوان»                 فصل فرعي (رقم عشري)
//   «الفصل 217الفصل الرابع حصار» / «الفصل 11الفصل 3 -الجزء الأول»   ترتيب محلي داخل العنوان
//   ترقيم يبدأ من 1 بكل مجلد           نرقّمها تسلسليًا لأن الموقع يميّز الفصل برقمه فقط
//
// طريقة الحل: لكل ملف نولّد أرقامًا محتملة مرتبة بالأرجحية، ثم نختار بحسب تسلسل بقية
// الملفات (الرقم الحقيقي غالبًا هو الفراغ الناقص، والرقم الشاذ الضخم مستحيل).

const MONTHS =
  'يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر';
const DATE_SUFFIX = new RegExp(`\\s*(?:${MONTHS})\\s*\\d{1,2}\\s*,?\\s*\\d{4}\\s*$`);
const FILE_LABEL = new RegExp(`${LABEL_WORD}[\\s\\-–—.:]*(\\d+)`, 'gi');
const EXTENSIONS = /\.(?:docx?|pdf|txt|epub|html?|rtf|odt)\b/gi;
const LAST_CHAPTER_PREFIX = /^\s*[أآا]خر\s*فصل\s*/;
const RANGE_SLACK_MIN = 30;

export type ResolvedFile = {
  name: string;
  number: number | null;
  title: string | null; // من اسم الملف (احتياطي)، بعد تجاهل العناوين الوهمية
  notes: string[]; // قرارات غير مؤكدة/تصحيحات — تُعرض بالسجل
};

type ParsedName = {
  name: string;
  digits: string; // الرقم كما كُتب بالاسم
  rest: string; // ما بعده (العنوان الخام)
  candidates: number[]; // بالأرجحية
  certain: boolean;
  volume: number | null;
  decimal: boolean;
};

const VOLUME_WORDS: Record<string, number> = {
  الأول: 1, الاول: 1, الثاني: 2, الثالث: 3, الرابع: 4, الخامس: 5, السادس: 6, السابع: 7,
  الثامن: 8, التاسع: 9, العاشر: 10,
};

function volumeOf(clean: string): number | null {
  const m = /(?:المجلد|مجلد)\s*(\d+|[\u0621-\u064A]+)/.exec(clean);
  if (!m) return null;
  const n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : VOLUME_WORDS[m[1]];
  return n ?? null;
}

function cleanName(filename: string): { clean: string; last: boolean } {
  let s = filename
    .replace(BIDI, '')
    .normalize('NFC')
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .replace(DATE_SUFFIX, '');
  const last = LAST_CHAPTER_PREFIX.test(s);
  s = s.replace(LAST_CHAPTER_PREFIX, '');
  return { clean: s, last };
}

function isHalvable(d: string): boolean {
  const h = d.length / 2;
  return d.length >= 2 && Number.isInteger(h) && d.slice(0, h) === d.slice(h);
}

function candidatesFor(digits: string, rest: string): { list: number[]; certain: boolean } {
  const d = digits.replace(/^0+/, '');
  if (!d) return { list: [], certain: false };
  const trimmed = rest.replace(EXTENSIONS, ' ').trim();
  const restLead = trimmed.replace(/^[\s\-–—:.،,]+/, '');
  const restNum = /^\d+/.exec(restLead)?.[0] ?? '';

  // حرف ملصوق مباشرة بالرقم = عنوان حقيقي: الرقم هو الرقم
  if (/^[^\s\d\-–—:.،,]/.test(rest)) return { list: [parseInt(d, 10)], certain: true };
  // «0451 451.docx» / «5 5- عنوان»: الرقم مكرر بعده
  if (restNum && restNum.replace(/^0+/, '') === d) return { list: [parseInt(d, 10)], certain: true };

  const blank = trimmed === '';
  const list: number[] = [];
  const add = (s: string) => {
    const n = parseInt(s, 10);
    if (n > 0 && !list.includes(n)) list.push(n);
  };
  // «161161- وريث» / «247247»: الموقع كرر الرقم مكان العنوان
  if (isHalvable(d) && (blank || /^[\-–—:.]/.test(rest.trim()))) add(d.slice(0, d.length / 2));
  add(d);
  // «10324» / «3390»: عنوان أرقام ملصوق بالرقم — كل بادئة محتملة
  if (blank) for (let k = d.length - 1; k >= 1; k--) add(d.slice(0, k));
  return { list, certain: list.length === 1 };
}

function parseName(filename: string): ParsedName {
  const { clean: name } = cleanName(filename);
  let digits = '';
  let rest = '';
  let decimal = false;
  for (const m of name.matchAll(FILE_LABEL)) {
    if (parseInt(m[1], 10) === 0) continue; // «الفصل 0» الوهمي
    digits = m[1];
    rest = name.slice((m.index ?? 0) + m[0].length);
    break;
  }
  if (!digits) {
    const m = /(\d+)/.exec(name); // ما فيه كلمة «الفصل» — أول رقم بالاسم
    if (m) {
      digits = m[1];
      rest = name.slice((m.index ?? 0) + m[0].length);
    }
  }
  if (/^\.\d/.test(rest)) decimal = true;
  const { list, certain } = digits ? candidatesFor(digits, decimal ? rest.replace(/^\.\d+/, '') : rest) : { list: [], certain: false };
  return { name: filename, digits, rest, candidates: list, certain, volume: volumeOf(name), decimal };
}

// ───────── العنوان من اسم الملف ─────────
function titleFromRest(rest: string, digits: string, chosen: number | null): string | null {
  let t = rest
    .replace(EXTENSIONS, ' ')
    .replace(/^\.\d+/, '') // «5.5» فصل فرعي
    .trim();
  // رقم الفصل مكرر بأول العنوان: «161- وريث» / «451»
  const dropNum = [digits.replace(/^0+/, ''), chosen ? String(chosen) : ''].filter(Boolean);
  for (const n of dropNum) {
    const re = new RegExp(`^[\\s\\-–—:.]*${n}(?!\\d)\\s*[.\\-–—:)]?\\s*`);
    if (re.test(t)) {
      t = t.replace(re, '');
      break;
    }
  }
  // ترتيب محلي داخل العنوان: «الفصل 3 -الجزء الأول» / «الفصل الرابع حصار»
  t = t.replace(
    new RegExp(`^\\s*${LABEL_WORD}\\s*(?:[0-9\\u0660-\\u0669]+|${ORDINAL})(?![\\u0621-\\u064A])\\s*[-–—:]?`, 'i'),
    ''
  );
  t = clean(t);
  return HAS_LETTER.test(t) ? t : null;
}

// عنوان وهمي: بقايا اسم ملف/رابط، أو يتكرر بأغلب الفصول (اسم الرواية ملصوق بكل فصل)
const JUNK_TITLE = /-kol\b|kolnovel|https?:|\.com\b/i;
function titleKey(t: string): string {
  return t.replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
}

// ───────── الجمع: اختيار الرقم بحسب تسلسل الملفات ─────────
function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

export function resolveFilenames(filenames: string[]): ResolvedFile[] {
  const parsed = filenames.map(parseName);
  const notes: string[][] = parsed.map(() => []);
  const chosen: (number | null)[] = parsed.map((p) => (p.certain ? p.candidates[0] : null));

  // الأرقام المؤكدة تحدد المدى المعقول: أي رقم أبعد بكثير منه مستحيل
  const certain = chosen.filter((n): n is number => n !== null).sort((a, b) => a - b);
  let hi = Infinity;
  if (certain.length >= 5) {
    const p95 = percentile(certain, 0.95);
    hi = Math.max(Math.ceil(p95 * 1.15), p95 + RANGE_SLACK_MIN);
  }
  const occupied = new Set<number>(certain);

  // الغامضة: نفضّل الرقم الفاضي داخل المدى (الفراغ الناقص بالتسلسل)، ونكرر لين يثبت الوضع
  const pending = parsed.map((p, i) => i).filter((i) => chosen[i] === null && parsed[i].candidates.length > 0);
  // كل الملفات (أو أغلبها) غامضة ولا يوجد ما نقارن به: الرقم الصحيح هو اللي يعطي تسلسلًا كثيفًا
  // بلا تكرار. مثال: «3390، 3400، 3410» = 339، 340، 341 والموقع ألصق صفرًا بكل رقم.
  if (certain.length < 5 && pending.length >= 5) {
    const strip = (i: number) => parsed[i].digits.replace(/^0+/, '');
    const transforms: Array<(i: number) => number> = [
      (i) => parsed[i].candidates[0],
      (i) => parseInt(strip(i).slice(0, -1), 10),
      (i) => parseInt(strip(i).slice(0, -2), 10),
    ];
    for (let t = 0; t < transforms.length; t++) {
      const values = pending.map(transforms[t]);
      if (values.some((v) => !(v > 0))) continue;
      const distinct = new Set(values);
      const span = Math.max(...values) - Math.min(...values) + 1;
      if (distinct.size >= values.length * 0.9 && span <= values.length * 1.6 + 20) {
        if (t > 0) {
          pending.forEach((i, k) => {
            chosen[i] = values[k];
            occupied.add(values[k]);
            notes[i].push(`رقم ملصوق بأرقام زايدة: «${parsed[i].digits}» ← ${values[k]} (تسلسل كثيف)`);
          });
          pending.length = 0;
        }
        break;
      }
    }
  }
  let progress = true;
  while (progress && pending.length > 0) {
    progress = false;
    for (let k = pending.length - 1; k >= 0; k--) {
      const i = pending[k];
      const free = parsed[i].candidates.filter((n) => n <= hi && !occupied.has(n));
      if (free.length === 1) {
        chosen[i] = free[0];
        occupied.add(free[0]);
        pending.splice(k, 1);
        progress = true;
        if (free[0] !== parsed[i].candidates[0]) {
          notes[i].push(`صحّحت الرقم من ${parseInt(parsed[i].digits, 10)} إلى ${free[0]} (الفراغ الناقص بالتسلسل)`);
        }
      }
    }
  }
  for (const i of pending) {
    const c = parsed[i].candidates;
    const pick = c.find((n) => n <= hi && !occupied.has(n)) ?? c.find((n) => n <= hi) ?? c[0];
    chosen[i] = pick;
    occupied.add(pick);
    if (pick !== parseInt(parsed[i].digits, 10)) notes[i].push(`غير مؤكد: قرأت الرقم ${pick} من «${parsed[i].digits}»`);
  }
  // بدون أي مرشح (اسم بلا أرقام)
  parsed.forEach((p, i) => {
    if (p.candidates.length === 0) chosen[i] = null;
  });

  // ترقيم يبدأ من 1 بكل مجلد → أرقام مكررة بين المجلدات. نرقّمها تسلسليًا بدل ما تكتب فوق بعضها
  const withNum = parsed.map((_, i) => i).filter((i) => chosen[i] !== null);
  const seen = new Map<number, number>();
  let dupFiles = 0;
  for (const i of withNum) seen.set(chosen[i]!, (seen.get(chosen[i]!) ?? 0) + 1);
  for (const c of seen.values()) if (c > 1) dupFiles += c;
  const volumes = new Set(withNum.map((i) => parsed[i].volume).filter((v): v is number => v !== null));
  if (dupFiles >= 10 && dupFiles / Math.max(1, withNum.length) >= 0.15 && volumes.size >= 2 && withNum.every((i) => parsed[i].volume !== null)) {
    const perVolume = new Map<number, Set<number>>();
    let uniqueInside = true;
    for (const i of withNum) {
      const v = parsed[i].volume!;
      const s = perVolume.get(v) ?? new Set<number>();
      if (s.has(chosen[i]!)) uniqueInside = false;
      s.add(chosen[i]!);
      perVolume.set(v, s);
    }
    if (uniqueInside) {
      const offsets = new Map<number, number>();
      let base = 0;
      for (const v of [...perVolume.keys()].sort((a, b) => a - b)) {
        offsets.set(v, base);
        base += Math.max(...perVolume.get(v)!);
      }
      for (const i of withNum) {
        const local = chosen[i]!;
        chosen[i] = local + offsets.get(parsed[i].volume!)!;
        notes[i].push(`الترقيم يبدأ من 1 بكل مجلد — صار ${chosen[i]} (كان ${local})`);
      }
    }
  }

  // العناوين من أسماء الملفات + كشف العناوين الوهمية المتكررة
  const rawTitles = parsed.map((p, i) => (chosen[i] === null ? null : titleFromRest(p.rest, p.digits, chosen[i])));
  const freq = new Map<string, number>();
  for (const t of rawTitles) if (t) freq.set(titleKey(t), (freq.get(titleKey(t)) ?? 0) + 1);
  // عنوان وهمي يتكرر: (١) فيه رقم الفصل نفسه وتكرر ٣ مرات فأكثر («اسم-الرواية-kol 994»)،
  // أو (٢) يغطي ١٠٪ فأكثر من الملفات. العناوين الحقيقية المتكررة («الخاتمة») أقل من كذا بكثير.
  const junkKeys = new Set<string>();
  for (const [k, c] of freq) {
    if (c >= 8 && c / Math.max(1, filenames.length) >= 0.1) junkKeys.add(k);
  }
  const hasOwnNumber = (t: string, n: number | null) => n !== null && new RegExp(`(?:^|\\D)${n}(?:\\D|$)`).test(t);
  return parsed.map((p, i) => {
    const t = rawTitles[i];
    const isJunk =
      !t ||
      JUNK_TITLE.test(t) ||
      junkKeys.has(titleKey(t)) ||
      (hasOwnNumber(t, chosen[i]) && (freq.get(titleKey(t)) ?? 0) >= 3);
    if (p.decimal) notes[i].push(`رقم عشري (${p.digits}${p.rest.match(/^\.\d+/)?.[0] ?? ''}) — انرفع برقم ${chosen[i]}`);
    return { name: p.name, number: chosen[i], title: isJunk ? null : t, notes: notes[i] };
  });
}

// اختصارات لملف واحد (بدون معرفة تسلسل بقية الملفات)
export function parseChapterNumber(filename: string): number | null {
  return resolveFilenames([filename])[0].number;
}
export function titleFromFilename(filename: string): string | null {
  return resolveFilenames([filename])[0].title;
}
