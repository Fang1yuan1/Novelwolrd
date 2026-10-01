import { supabase } from "./supabase";
import type { Novel } from "./novels";

// إعداد عام للموقع كله: الأسماء تظهر بالعربي ولا بالإنجليزي. بيتخزن بنفس جدول
// site_settings (صف key = 'display_language')، ويتغيّر من /admin/display-language.
export type DisplayLanguage = "ar" | "en";

const SETTINGS_KEY = "display_language";
const DEFAULT_LANGUAGE: DisplayLanguage = "ar";

function normalize(value: unknown): DisplayLanguage {
  const lang = (value as { lang?: unknown })?.lang;
  return lang === "en" ? "en" : DEFAULT_LANGUAGE;
}

export async function fetchDisplayLanguage(): Promise<{
  lang: DisplayLanguage;
  error: string | null;
}> {
  if (!supabase) return { lang: DEFAULT_LANGUAGE, error: "Supabase غير مهيّأ." };
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error) return { lang: DEFAULT_LANGUAGE, error: error.message };
    return { lang: normalize(data?.value), error: null };
  } catch (e) {
    return { lang: DEFAULT_LANGUAGE, error: e instanceof Error ? e.message : String(e) };
  }
}

// للموقع نفسه: دايمًا يرجع قيمة صالحة
export async function getDisplayLanguage(): Promise<DisplayLanguage> {
  const { lang } = await fetchDisplayLanguage();
  return lang;
}

export async function saveDisplayLanguage(
  lang: DisplayLanguage
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("site_settings").upsert(
    { key: SETTINGS_KEY, value: { lang }, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// الاسم اللي يُعرض فعليًا حسب الإعداد. لو مفيش اسم إنجليزي محفوظ للرواية دي، يرجع
// للعربي تلقائيًا (أفضل من عرض فراغ).
export function displayTitle(
  novel: Pick<Novel, "title" | "title_en">,
  lang: DisplayLanguage
): string {
  if (lang === "en" && novel.title_en?.trim()) return novel.title_en.trim();
  return novel.title;
}
