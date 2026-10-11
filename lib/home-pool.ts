import type { Novel } from "./novels";

// توزيع روايات الصفحة الرئيسية على الأقسام بدون تكرار قدر الإمكان:
// كل رواية تظهر بقسم واحد فقط ما دام عدد الروايات يكفي، فيحس القارئ بتنوّع المكتبة.
// عند نفاد الروايات الجديدة يُعاد استخدام الأقدم ظهورًا (وليس الأقرب للقسم السابق).
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makePicker(pool: Novel[]) {
  const usedAt = new Map<number, number>();
  let tick = 0;

  const mark = (list: Novel[]) => list.forEach((n) => usedAt.set(n.id, ++tick));

  function take(count: number, pred: (n: Novel) => boolean = () => true): Novel[] {
    const out: Novel[] = [];
    for (const n of pool) {
      if (out.length >= count) break;
      if (!usedAt.has(n.id) && pred(n)) out.push(n);
    }
    if (out.length < count) {
      const rest = pool
        .filter((n) => !out.includes(n) && usedAt.has(n.id) && pred(n))
        .sort((a, b) => (usedAt.get(a.id) ?? 0) - (usedAt.get(b.id) ?? 0));
      out.push(...rest.slice(0, count - out.length));
    }
    mark(out);
    return out;
  }

  // الروايات التي لم تُستخدم بعد أولًا، ثم المستخدمة (لأقسام تعرض قوائم أطول كالتصنيفات)
  function leftoverFirst(): Novel[] {
    return [...pool.filter((n) => !usedAt.has(n.id)), ...pool.filter((n) => usedAt.has(n.id))];
  }

  return { take, mark, leftoverFirst };
}
