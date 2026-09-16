// تبرير عربي بأسلوب الكشيدة (تمديد الحروف المتصلة) بدل تمديد المسافات بين الكلمات —
// يشتغل بعد أول رسم للفقرات، يقيس كل سطر فعليًا بالمتصفح، ويحط كشيدة (ـ) بأماكن
// الاتصال المناسبة جوا الكلمات بس، عشان يوصل السطر لحافة العمود بدون ما يكبر الفراغ
// بين الكلمات نفسها. ملاحظة: هذا كله يصير على النص المعروض بالمتصفح فقط — ما يلمس
// ولا يغيّر النص المخزّن بقاعدة البيانات إطلاقًا.

const TATWEEL = "\u0640";

// حروف ما تتصل بالحرف اللي بعدها (اتصال باتجاه واحد بس) — ما نحط كشيدة بعدها أبدًا
const NON_CONNECTING = new Set([
  "ا", "أ", "إ", "آ", "د", "ذ", "ر", "ز", "و", "ؤ", "ة", "ى",
]);

function isConnectableLetter(ch: string): boolean {
  return /[\u0621-\u064A]/.test(ch) && !NON_CONNECTING.has(ch);
}

function measureTatweelWidth(referenceEl: HTMLElement): number {
  const span = document.createElement("span");
  span.textContent = TATWEEL.repeat(10);
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "pre";
  const cs = getComputedStyle(referenceEl);
  span.style.fontSize = cs.fontSize;
  span.style.fontFamily = cs.fontFamily;
  span.style.fontWeight = cs.fontWeight;
  document.body.appendChild(span);
  const width = span.getBoundingClientRect().width / 10;
  document.body.removeChild(span);
  return width || 8;
}

function processParagraph(p: HTMLParagraphElement, range: Range) {
  // نشيل أي كشيدة انحطت بمحاولة سابقة (لو أعدنا الحساب بعد تغيير حجم الخط مثلًا)
  // عشان نرجع دايمًا نقيس من النص الأصلي الصافي
  const original = (p.textContent || "").replace(new RegExp(TATWEEL, "g"), "");
  if (original.length < 4) return;
  if (p.textContent !== original) p.textContent = original;

  const textNode = p.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  type CharRect = { top: number; left: number; right: number };
  const rects: CharRect[] = new Array(original.length);
  for (let i = 0; i < original.length; i++) {
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    const r = range.getBoundingClientRect();
    rects[i] = { top: Math.round(r.top), left: r.left, right: r.right };
  }

  type Line = { start: number; end: number; top: number; minLeft: number; maxRight: number };
  const lines: Line[] = [];
  let cur: Line | null = null;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r.left === 0 && r.right === 0) continue;
    if (!cur || Math.abs(r.top - cur.top) > 3) {
      if (cur) lines.push(cur);
      cur = { start: i, end: i, top: r.top, minLeft: r.left, maxRight: r.right };
    } else {
      cur.end = i;
      if (r.left < cur.minLeft) cur.minLeft = r.left;
      if (r.right > cur.maxRight) cur.maxRight = r.right;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length < 2) return; // فقرة بسطر وحيد — ما تحتاج تبرير كشيدة

  const fullWidth = p.getBoundingClientRect().width;
  const tatweelWidth = measureTatweelWidth(p);
  const MAX_PER_GAP = 3;

  const insertions: { at: number; count: number }[] = [];

  // آخر سطر بالفقرة يضل بدون تبرير (نفس عرف الطباعة العادي) — نوقف قبله
  for (let li = 0; li < lines.length - 1; li++) {
    const line = lines[li];
    const used = line.maxRight - line.minLeft;
    const deficit = fullWidth - used;
    if (deficit < tatweelWidth * 0.8) continue;

    const gaps: number[] = [];
    for (let i = line.start; i < line.end; i++) {
      const a = original[i];
      const b = original[i + 1];
      if (!a || !b || a === " " || b === " ") continue;
      if (!isConnectableLetter(a)) continue;
      gaps.push(i + 1);
    }
    if (gaps.length === 0) continue;

    // هامش أمان (-1) عشان نميل لتبرير أقل شوي بدل ما نفيض للسطر التالي
    const totalTatweels = Math.max(0, Math.floor(deficit / tatweelWidth) - 1);
    if (totalTatweels === 0) continue;

    const perGap = new Map<number, number>();
    let remaining = totalTatweels;
    let gi = 0;
    let safety = gaps.length * MAX_PER_GAP * 2 + 10;
    while (remaining > 0 && safety-- > 0) {
      const at = gaps[gi % gaps.length];
      const count = perGap.get(at) ?? 0;
      if (count < MAX_PER_GAP) {
        perGap.set(at, count + 1);
        remaining--;
      }
      gi++;
    }
    perGap.forEach((count, at) => insertions.push({ at, count }));
  }

  if (insertions.length === 0) return;

  insertions.sort((a, b) => b.at - a.at); // من النهاية للبداية عشان الفهارس ما تتزحزح
  let newText = original;
  for (const { at, count } of insertions) {
    newText = newText.slice(0, at) + TATWEEL.repeat(count) + newText.slice(at);
  }
  p.textContent = newText;
}

export function applyKashidaJustify(container: HTMLElement | null) {
  if (!container) return;
  const paragraphs = container.querySelectorAll("p");
  if (paragraphs.length === 0) return;
  const range = document.createRange();
  paragraphs.forEach((p) => {
    try {
      processParagraph(p as HTMLParagraphElement, range);
    } catch {
      // أي فقرة تفشل قياسها تُترك زي ما هي بدون ما توقف الباقي
    }
  });
}
