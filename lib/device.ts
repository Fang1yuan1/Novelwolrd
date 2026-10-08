// ============================================================================
// أداة تحديد نوع الجهاز — دقيقة (مش بس عرض الشاشة زي sm:/md: بتيلويند)
// ============================================================================
// الفكرة: الاعتماد على عرض الشاشة وحده (CSS breakpoints) غير دقيق لأن أي نافذة
// ممكن تتغيّر مقاسها (آيباد بوضع Split View، نافذة متصفح مصغّرة على لابتوب،
// تكبير النص... إلخ) فتنتقل بين "موبايل" و"ديسكتوب" بالغلط رغم إن الجهاز نفسه
// ما تغيّر. هذا الملف يصنّف الجهاز الحقيقي من الـUser-Agent (ثابت ما يتغيّر
// بتغيّر حجم النافذة)، وهو ملف مستقل بدون أي اعتماديات — تقدر تنسخه لأي موقع
// ثاني كما هو (Next.js أو React عادي أو حتى بدون فريموورك).
//
// القاعدة المستخدمة بهذا المشروع (وبأي موقع ثاني تحطه فيه): "آيفون/أندرويد
// بوضع جوال" = phone، وأي شيء ثاني (آيباد، تابلت أندرويد، لابتوب، ديسكتوب) كلهم
// يُعاملوا كفئة واحدة "non-phone" — لأن التصميم بالموقع مبني على قسمين بس:
// نسخة الجوال ونسخة كل الشاشات الأكبر (آيباد واللابتوب يشتركوا بنفس النسخة).

export type DeviceKind = "phone" | "tablet" | "desktop";

/**
 * يصنّف الجهاز من نص الـUser-Agent وحده (يشتغل بالسيرفر وبالمتصفح).
 * ملاحظة مهمة: آيباد الحديث (iPadOS 13+) بمتصفح سفاري يرسل User-Agent
 * مطابق تمامًا للماك الحقيقي ("Macintosh")، فمستحيل تفريقه عن لابتوب حقيقي
 * من الهيدر وحده — هذا تحديدًا سبب ليه القاعدة فوق (معاملة آيباد ولابتوب
 * كفئة وحدة) مناسبة: ما نحتاج أصلاً نفرّق بينهم.
 */
export function classifyUserAgent(ua: string): DeviceKind {
  const s = (ua || "").toLowerCase();
  if (!s) return "desktop";

  // آيفون/آيبود — جوال دايمًا
  if (/iphone|ipod/.test(s)) return "phone";

  // آيباد قديم (قبل iPadOS 13) لسه يكتب "iPad" صراحة بالـUA
  if (/ipad/.test(s)) return "tablet";

  // أندرويد: وجود كلمة "mobile" بالسلسلة = جوال أندرويد، غيابها = تابلت أندرويد
  if (/android/.test(s)) {
    return /mobile/.test(s) ? "phone" : "tablet";
  }

  // أجهزة تابلت ثانية معروفة
  if (/tablet|playbook|silk|kindle/.test(s)) return "tablet";

  // أي شيء ثاني (ويندوز، لينكس، ماك حقيقي، أو آيباد حديث متخفي بـMacintosh) = غير جوال
  return "desktop";
}

/** true فقط لو "جوال فعلي" — آيباد ولابتوب ودِسكتوب كلهم false (نفس الفئة) */
export function isPhoneUA(ua: string): boolean {
  return classifyUserAgent(ua) === "phone";
}

/**
 * نفس التصنيف لكن بالمتصفح، مع تمييز إضافي: آيباد حديث يتخفى كـ"Macintosh"
 * نقدر نكشفه عبر اللمس (maxTouchPoints) — ماك حقيقي ما عنده لمس، آيباد عنده.
 * مفيد لو احتجت لاحقًا تفرّق آيباد عن لابتوب فعليًا (التصميم الحالي ما يحتاجها
 * لأنه يعامل الاثنين نفس الشي، لكن الدالة موجودة لو احتجتها بمشروع ثاني).
 */
export function detectDeviceKindClient(): DeviceKind {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const kind = classifyUserAgent(ua);
  if (kind === "desktop" && /macintosh/i.test(ua) && (navigator as any).maxTouchPoints > 1) {
    return "tablet"; // آيباد حديث (سفاري) يرسل نفس UA الماك، يتكشف باللمس بس
  }
  return kind;
}

export function isPhoneClient(): boolean {
  return detectDeviceKindClient() === "phone";
}
