import { supabase } from "./supabase";

export type Novel = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
  // حقول اختيارية — لو أضفتها لجدول novels في Supabase هتظهر تلقائيًا،
  // ولو مش موجودة الواجهة بتتعامل معاها بأمان (تخفي القسم أو تعرض بديل).
  author?: string | null;
  status?: "ongoing" | "completed" | string | null;
  tags?: string | null; // نص مفصول بفواصل، مثال: "VIP,روايات خفيفة,خيال أصلي"
};

export type Chapter = {
  id: number;
  created_at: string;
  novel_id: number;
  chapter_number: number;
  title: string | null;
  content: string;
  volume: string | null;
};

export type LatestUpdate = {
  chapter_id: number;
  chapter_number: number;
  chapter_title: string | null;
  created_at: string;
  novel_id: number;
  novel_title: string;
  novel_category: string | null;
};

// كل الروايات، الأحدث أولًا
export async function getNovels(limit?: number): Promise<Novel[]> {
  if (!supabase) return [];
  let query = supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Novel[];
}

// رواية واحدة بالتفصيل
export async function getNovelById(id: number | string): Promise<Novel | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Novel;
}

// كل فصول رواية معيّنة، مرتبة برقم الفصل
export async function getChaptersByNovel(novelId: number | string): Promise<Chapter[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novelId)
    .order("chapter_number", { ascending: true });
  if (error || !data) return [];
  return data as Chapter[];
}

// فصل واحد برقمه
export async function getChapterByNumber(
  novelId: number | string,
  chapterNumber: number | string
): Promise<Chapter | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novelId)
    .eq("chapter_number", chapterNumber)
    .single();
  if (error || !data) return null;
  return data as Chapter;
}

// تجميع الفصول حسب الجزء/المجلد (volume)
export function groupChaptersByVolume(
  chapters: Chapter[]
): { volume: string; chapters: Chapter[] }[] {
  const groups = new Map<string, Chapter[]>();
  const noVolumeKey = "الفصول";
  for (const ch of chapters) {
    const key = ch.volume?.trim() || noVolumeKey;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ch);
  }
  return Array.from(groups.entries()).map(([volume, chapters]) => ({
    volume,
    chapters,
  }));
}

// عدد الفصول لرواية معيّنة (بدون سحب المحتوى الكامل)
export async function getChapterCount(novelId: number | string): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("chapters")
    .select("id", { count: "exact", head: true })
    .eq("novel_id", novelId);
  if (error || count == null) return 0;
  return count;
}

// آخر الفصول المضافة عبر كل الروايات (لقسم "آخر التحديثات")
export async function getLatestUpdates(limit = 20): Promise<LatestUpdate[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, novel_id, novels(id, title, category)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as any[])
    .filter((row) => row.novels)
    .map((row) => ({
      chapter_id: row.id,
      chapter_number: row.chapter_number,
      chapter_title: row.title,
      created_at: row.created_at,
      novel_id: row.novels.id,
      novel_title: row.novels.title,
      novel_category: row.novels.category,
    }));
}

// تقسيم حقل التصنيف (قد يحتوي أكتر من تصنيف مفصول بفواصل) لمصفوفة نظيفة
export function parseCategories(category: string | null | undefined): string[] {
  if (!category) return [];
  return category
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

// دمج مصفوفة تصنيفات في نص واحد مفصول بفواصل، جاهز للحفظ في Supabase
export function joinCategories(categories: string[]): string {
  return categories.map((c) => c.trim()).filter(Boolean).join(",");
}

// التصنيفات الموجودة فعليًا مع عدد الروايات بكل تصنيف (مبني على جدول novels)
// كل رواية ممكن يكون ليها أكتر من تصنيف — كل تصنيف بيتحسب على حدة
export async function getCategoriesWithCounts(): Promise<
  { category: string; count: number }[]
> {
  const novels = await getNovels();
  const map = new Map<string, number>();
  for (const n of novels) {
    for (const cat of parseCategories(n.category)) {
      map.set(cat, (map.get(cat) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([category, count]) => ({
    category,
    count,
  }));
}

// كل الروايات اللي تحت تصنيف معيّن (اسم التصنيف بالضبط) — لصفحة التصنيف الحقيقية
export async function getNovelsByCategory(categoryName: string): Promise<Novel[]> {
  const all = await getNovels();
  return all.filter((n) => parseCategories(n.category).includes(categoryName));
}

// روايات مشابهة (بينها تصنيف مشترك واحد على الأقل) لعرضها في صفحة التفاصيل
export async function getRelatedNovels(
  category: string | null,
  excludeId: number | string,
  limit = 6
): Promise<Novel[]> {
  if (!supabase || !category) return [];
  const wanted = new Set(parseCategories(category));
  if (wanted.size === 0) return [];
  // نجيب كل الروايات ونفلتر في الكود، لأن التصنيفات نص حر مفصول بفواصل
  // (ما ينفعش نبحث بـ eq مباشر لما يبقى فيه أكتر من تصنيف في نفس الحقل)
  const all = await getNovels();
  return all
    .filter((n) => n.id !== Number(excludeId))
    .filter((n) => parseCategories(n.category).some((c) => wanted.has(c)))
    .slice(0, limit);
}

// إجمالي عدد الأحرف عبر كل فصول الرواية — تقدير حقيقي لعدد الكلمات (بدل رقم وهمي)
export function getWordCount(chapters: Chapter[]): number {
  return chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0);
}

// تنسيق عدد كبير بصيغة مختصرة (مثال: 134582 → "134.6 ألف")
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} مليون`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} ألف`;
  return `${n}`;
}

// تنسيق وقت نسبي بسيط (اليوم، أمس، أو تاريخ)
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} د`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `منذ ${diffHour} س`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  return date.toLocaleDateString("ar", { day: "numeric", month: "short", year: "numeric" });
}
