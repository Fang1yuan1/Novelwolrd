import { supabase } from "./supabase";
import type { Book } from "./placeholder-data";

// هذي الأنواع تطابق أعمدة جداول Supabase الفعلية (novels / chapters)
export type NovelRow = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string | null;
};

export type ChapterRow = {
  id: number;
  created_at: string;
  novel_id: number;
  chapter_number: number;
  title: string | null;
  content: string | null;
  volume: string | null;
};

// تحويل صف novels من القاعدة إلى شكل Book اللي تتوقعه المكونات الحالية
// (NovelCard, EditorPicks...) عشان ما نضطر نغيّر كل مكون دفعة وحدة
function toBook(row: NovelRow): Book {
  return {
    id: String(row.id),
    title: row.title,
    blurb: row.description ?? "",
    tag: row.category ?? undefined,
  };
}

// جلب قائمة الروايات (مرتبة من الأحدث)
export async function getNovels(limit = 6): Promise<Book[]> {
  const { data, error } = await supabase
    .from("novels")
    .select("id, created_at, title, description, cover_url, category")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("خطأ في جلب الروايات من Supabase:", error.message);
    return [];
  }

  return (data as NovelRow[]).map(toBook);
}

// جلب فصل واحد بالرقم مع اسم الرواية، وتحديد هل فيه فصل سابق/تالي
export async function getChapterByNumber(novelId: number, chapterNumber: number) {
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, content, novels(id, title)")
    .eq("novel_id", novelId)
    .eq("chapter_number", chapterNumber)
    .single();

  if (error || !chapter) {
    console.error("خطأ في جلب الفصل:", error?.message);
    return null;
  }

  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_id", novelId)
      .eq("chapter_number", chapterNumber - 1)
      .maybeSingle(),
    supabase
      .from("chapters")
      .select("chapter_number")
      .eq("novel_id", novelId)
      .eq("chapter_number", chapterNumber + 1)
      .maybeSingle(),
  ]);

  return {
    chapter,
    hasPrev: Boolean(prev),
    hasNext: Boolean(next),
  };
}

// جلب رواية واحدة بالتفصيل مع فصولها
export async function getNovelById(id: number) {
  const { data: novel, error: novelError } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .single();

  if (novelError) {
    console.error("خطأ في جلب الرواية:", novelError.message);
    return null;
  }

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, volume")
    .eq("novel_id", id)
    .order("chapter_number", { ascending: true });

  if (chaptersError) {
    console.error("خطأ في جلب الفصول:", chaptersError.message);
  }

  return {
    novel: novel as NovelRow,
    chapters: (chapters ?? []) as Pick<
      ChapterRow,
      "id" | "chapter_number" | "title" | "created_at" | "volume"
    >[],
  };
}

// يقسم قائمة فصول مرتبة إلى مجموعات حسب عمود volume (متتالية بالترتيب)
// فصول بدون volume تترمى بمجموعة "الفصول" الافتراضية
export function groupChaptersByVolume<
  T extends { volume: string | null }
>(chapters: T[]): { volume: string; chapters: T[] }[] {
  const groups: { volume: string; chapters: T[] }[] = [];

  for (const ch of chapters) {
    const label = ch.volume?.trim() || "الفصول";
    const last = groups[groups.length - 1];
    if (last && last.volume === label) {
      last.chapters.push(ch);
    } else {
      groups.push({ volume: label, chapters: [ch] });
    }
  }

  return groups;
}
