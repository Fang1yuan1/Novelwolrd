import { supabase } from "./supabase";

export type Category = {
  id: number;
  created_at: string;
  name: string;
  icon: string | null;
};

// كل التصنيفات، مرتبة أبجديًا
export async function getCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data as Category[];
}

// إضافة تصنيف جديد
export async function addCategory(
  name: string,
  icon: string
): Promise<{ ok: true; category: Category } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), icon: icon.trim() || "📚" })
    .select("*")
    .single();
  if (error || !data) {
    return { ok: false, message: error?.message || "حدث خطأ غير متوقع." };
  }
  return { ok: true, category: data as Category };
}

// تحديث أيقونة تصنيف موجود (إيموجي أو مسار صورة)
export async function updateCategoryIcon(
  id: number,
  icon: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase
    .from("categories")
    .update({ icon: icon.trim() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// حذف تصنيف
export async function deleteCategory(
  id: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
