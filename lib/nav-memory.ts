// يتذكّر «الصفحة الرئيسية السابقة» للتنقل حتى يعرف زر الرجوع بصفحة تفاصيل الرواية إلى أين يعود:
// كل صفحات رواية واحدة (التفاصيل/الفصول/الفهرس/المملكة) تُحسب مكانًا واحدًا، فلا يعيدك السهم إلى فصل قرأته.
const KEY = "nw_nav";

type Memory = { last: string | null; prev: string | null };

export function placeKey(pathname: string): string {
  const m = pathname.match(/^\/novel\/(\d+)(\/.*)?$/);
  return m ? `/novel/${m[1]}` : pathname.split("?")[0] || "/";
}

function read(): Memory {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as Memory;
      return { last: v.last ?? null, prev: v.prev ?? null };
    }
  } catch {}
  return { last: null, prev: null };
}

export function trackPath(pathname: string): void {
  try {
    const key = placeKey(pathname);
    const m = read();
    if (m.last === key) return;
    sessionStorage.setItem(KEY, JSON.stringify({ prev: m.last, last: key }));
  } catch {}
}

// وجهة الرجوع من صفحة معيّنة: المكان السابق المختلف عنها (أو null إن لم يوجد)
export function backTarget(pathname: string): string | null {
  const key = placeKey(pathname);
  const m = read();
  if (m.last === key && m.prev && m.prev !== key) return m.prev;
  return null;
}
