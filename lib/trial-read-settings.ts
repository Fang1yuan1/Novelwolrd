import { supabase } from "./supabase";

// إعدادات قسم «الفصل التجريبي» بصفحة تفاصيل الرواية (نسخة الهاتف): الكلمات وأحجام الخطوط.
// بتتخزن بجدول site_settings (صف واحد key = 'trial_read')، وتتعدّل من /admin/trial-read.
// لو الجدول لسه ما اتعملش أو فيه أي مشكلة، الموقع يشتغل بالقيم الافتراضية تحت.

export type TrialReadSettings = {
  tab1: string; // التبويب الأول (النشط)
  tab2: string;
  tab3: string;
  discussion: string; // سطر «نقاش نشط…» (بجنب أيقونة النار)
  tabsSize: number; // حجم خط التبويبات (px)
  discussionSize: number; // حجم خط سطر النقاش (px)
  titleSize: number; // حجم خط عنوان الفصل (px)
  bodyOffset: number; // كم بكسل أصغر من خط صفحة القراءة يكون نص الفصل (سالب = أكبر)
};

export const DEFAULT_TRIAL_READ_SETTINGS: TrialReadSettings = {
  tab1: "فصل تجريبي",
  tab2: "مزيد من المحتوى ذي الصلة",
  tab3: "توصيات ويب تون",
  discussion: "نقاش نشط حول هذا الفصل",
  tabsSize: 15,
  discussionSize: 12,
  titleSize: 19,
  bodyOffset: 2,
};

const SETTINGS_KEY = "trial_read";

function cleanText(value: unknown, fallback: string): string {
  // النص الفاضي مسموح (معناه: أخفي العنصر ده)، بس لو القيمة مش نص أصلًا نرجع للافتراضي
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function normalizeTrialReadSettings(raw: unknown): TrialReadSettings {
  const d = DEFAULT_TRIAL_READ_SETTINGS;
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    tab1: cleanText(r.tab1, d.tab1),
    tab2: cleanText(r.tab2, d.tab2),
    tab3: cleanText(r.tab3, d.tab3),
    discussion: cleanText(r.discussion, d.discussion),
    tabsSize: cleanNumber(r.tabsSize, d.tabsSize, 8, 40),
    discussionSize: cleanNumber(r.discussionSize, d.discussionSize, 8, 30),
    titleSize: cleanNumber(r.titleSize, d.titleSize, 10, 48),
    bodyOffset: cleanNumber(r.bodyOffset, d.bodyOffset, -8, 12),
  };
}

// يرجّع الإعدادات + رسالة خطأ لو حصلت مشكلة (لصفحة الأدمن عشان تعرض تنبيه واضح)
export async function fetchTrialReadSettings(): Promise<{
  settings: TrialReadSettings;
  error: string | null;
}> {
  if (!supabase) {
    return { settings: DEFAULT_TRIAL_READ_SETTINGS, error: "Supabase غير مهيّأ." };
  }
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error) return { settings: DEFAULT_TRIAL_READ_SETTINGS, error: error.message };
    if (!data) return { settings: DEFAULT_TRIAL_READ_SETTINGS, error: null };
    return { settings: normalizeTrialReadSettings(data.value), error: null };
  } catch (e) {
    return {
      settings: DEFAULT_TRIAL_READ_SETTINGS,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// للموقع نفسه: دايمًا يرجع قيمة صالحة (افتراضية لو فيه أي مشكلة)
export async function getTrialReadSettings(): Promise<TrialReadSettings> {
  const { settings } = await fetchTrialReadSettings();
  return settings;
}

export async function saveTrialReadSettings(
  input: TrialReadSettings
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: SETTINGS_KEY,
      value: normalizeTrialReadSettings(input),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
