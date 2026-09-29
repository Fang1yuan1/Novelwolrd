// إعادة بناء فقرات الفصل — شبكة أمان تشتغل وقت العرض بس، بدون ما تلمس النص المخزّن.
//
// القانون الأساسي (زي ما هو الحين): نقسّم على أي سطر جديد \n+ — فصل طبيعي فيه أسطر
// جديدة حقيقية يبقى زي ما هو تمامًا، ما يتغيّر فيه شي.
//
// شبكة الأمان: لو فقرة وحدة (بعد التقسيم العادي) طولها 40% أو أكثر من طول الفصل كامل
// (يعني تشابك حقيقي، جزئي أو كلي)، نعيد تقطيع تلك الفقرة بس (الباقي يبقى كما هو) حسب
// نفس أسلوب الفصل الطبيعي المؤكد: فقرة قصيرة تنتهي عادة بنقطة "." أو تعجب "!" أو
// استفهام "؟" أو نقاط حذف "…" أو علامة تنصيص ختامية.

const SENTENCE_END_RE = /([.!؟…"”])\s+(?=\S)/;
const TANGLE_RATIO_THRESHOLD = 0.4;

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

  const totalLen = paras.reduce((sum, p) => sum + p.length, 0);
  if (totalLen === 0) return paras;

  let maxIdx = 0;
  for (let i = 1; i < paras.length; i++) {
    if (paras[i].length > paras[maxIdx].length) maxIdx = i;
  }

  if (paras[maxIdx].length / totalLen < TANGLE_RATIO_THRESHOLD) {
    return paras; // مو متشابك بما يكفي (أقل من 40%) — يرجع زي ما هو، بدون أي تدخل
  }

  const rebuilt = resplitBySentence(paras[maxIdx]);
  if (rebuilt.length <= 1) return paras; // ما قدرنا نقطّعها لأي سبب — نسيبها زي ما هي، أسلم من تقطيع عشوائي

  const result = [...paras];
  result.splice(maxIdx, 1, ...rebuilt);
  return result;
}
