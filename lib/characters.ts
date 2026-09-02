import { supabase } from "./supabase";

export type Character = {
  id: number;
  created_at: string;
  novel_id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  description: string | null;
  likes: number;
  sort_order: number;
};

// كل شخصيات رواية معيّنة، مرتبة حسب sort_order ثم تاريخ الإضافة
export async function getCharactersByNovel(
  novelId: number | string
): Promise<Character[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("novel_id", novelId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as Character[];
}

export async function createCharacter(input: {
  novel_id: number;
  name: string;
  role?: string | null;
  avatar_url?: string | null;
  description?: string | null;
  likes?: number;
  sort_order?: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("characters").insert({
    novel_id: input.novel_id,
    name: input.name,
    role: input.role || null,
    avatar_url: input.avatar_url || null,
    description: input.description || null,
    likes: input.likes ?? 0,
    sort_order: input.sort_order ?? 0,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function updateCharacter(
  id: number,
  input: Partial<{
    name: string;
    role: string | null;
    avatar_url: string | null;
    description: string | null;
    likes: number;
    sort_order: number;
  }>
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("characters").update(input).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteCharacter(
  id: number
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) return { ok: false, message: "Supabase غير مهيّأ." };
  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
