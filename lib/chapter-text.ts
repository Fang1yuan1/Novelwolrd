// إعادة بناء فقرات الفصل — شبكة أمان تشتغل وقت العرض بس، بدون ما تلمس النص المخزّن.
//
// القانون الأساسي (زي ما هو الحين): نقسّم على أي سطر جديد \n+ — فصل طبيعي فيه أسطر
// جديدة حقيقية يبقى زي ما هو تمامًا، ما يتغيّر فيه شي.
//
// شبكة الأمان: نفحص كل فقرة لحالها (مو نسبة من كامل الفصل) — أي فقرة وحدة يتجاوز
// طولها 255 حرف، وفيها أكثر من جملة فعليًا (تتقطع حسب قانون نهاية الجملة)، تنقطّع
// لأسطرها المنفصلة. فقرة قصيرة، أو فقرة طويلة بس جملة وحدة بلا نقطة تقطيع داخلها،
// تبقى زي ما هي — بهذا ننكشف حتى الفصول اللي فيها عدة كتل متشابكة متوسطة (مو بس
// كتلة وحدة عملاقة تهيمن على الفصل كله).

const SENTENCE_END_RE = /([.!؟…"”])\s+(?=\S)/;
const TANGLE_MIN_CHARS = 255;

function resplitBySentence(text: string): string[] {
  const parts = text.split(SENTENCE_END_RE);
  const out: string[] = [];
  let i = 0;
  while (i < parts.length) {
    let piece = parts[i];
    if (i + 1 < parts.length && parts[i + 1] && '.!؟…"”'.includes(parts[i + 1])) {
      piece += parts[i + 1];
      i += 2;
    } else {
      i += 1;
    }
    piece = piece.trim();
    if (piece) out.push(piece);
  }
  return out;
}

export function splitChapterParagraphs(content: string): string[] {
  const paras = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paras.length === 0) return [];

  const result: string[] = [];
  for (const para of paras) {
    if (para.length >= TANGLE_MIN_CHARS) {
      const rebuilt = resplitBySentence(para);
      if (rebuilt.length > 1) {
        result.push(...rebuilt);
        continue;
      }
    }
    result.push(para); // قصيرة، أو طويلة بس بلا نقطة تقطيع فعلية — تبقى زي ما هي
  }
  return result;
}
