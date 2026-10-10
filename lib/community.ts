"use client";

import { supabase } from "./supabase";
import { COPY, type PostKind } from "./community-copy";

// ───────── الأنواع ─────────
export type CommunityPost = {
  id: number;
  novel_id: number;
  novel_title: string;
  kind: PostKind;
  title: string | null;
  body: string;
  is_pinned: boolean;
  is_featured: boolean;
  comments_count: number;
  likes_count: number;
  created_at: string;
  last_activity_at: string;
  author_name: string;
  author_hue: number;
  author_title: string | null;
  author_points: number;
  author_avatar: string | null;
};

export type CommunityComment = {
  id: number;
  post_id: number;
  body: string;
  created_at: string;
  author_name: string;
  author_hue: number;
  author_title: string | null;
  author_points: number;
  author_avatar: string | null;
};

export type SortKey = "activity" | "newest" | "likes";
export type TabKey = "feed" | "featured" | "fanwork";

export const PAGE_SIZE = 15;

// ───────── الهوية (حساب Supabase: غوغل أو بريد) ─────────
import { displayNameOf } from "./auth";

async function sessionUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

// يسجّل القارئ بجدول الكتّاب بأول مشاركة (الاسم من غوغل/البريد) — مرة واحدة لكل حساب بهذا المتصفح
async function ensureAuthor(): Promise<string> {
  const u = await sessionUser();
  if (!supabase || !u) throw new Error("no_identity");
  const flag = `nw_cm_reg_${u.id}`;
  let done = false;
  try {
    done = localStorage.getItem(flag) === "1";
  } catch {}
  if (!done) {
    const { error } = await supabase.rpc("community_register", {
      p_key: u.id,
      p_name: displayNameOf(u),
      p_hue: hueFromKey(u.id),
      p_title: null,
    });
    if (error) throw new Error(error.message);
    // صورة/نبذة الحساب تنتقل لسجل المملكة (تفشل بصمت إن لم يُشغَّل ملف SQL الخاص بالملف الشخصي)
    const m = (u.user_metadata ?? {}) as { avatar_url?: string; bio?: string };
    await supabase
      .rpc("community_set_profile", { p_name: displayNameOf(u), p_avatar_url: m.avatar_url ?? "", p_bio: m.bio ?? "" })
      .then(
        () => {},
        () => {}
      );
    try {
      localStorage.setItem(flag, "1");
    } catch {}
  }
  return u.id;
}

// تغيير اسم العرض (يحدّث حساب القارئ وسجل المملكة)
export async function renameAuthor(name: string): Promise<void> {
  if (!supabase) throw new Error("offline");
  const u = await sessionUser();
  if (!u) throw new Error("no_identity");
  const clean = name.trim().slice(0, 24);
  const { error: e1 } = await supabase.auth.updateUser({ data: { display_name: clean } });
  if (e1) throw new Error(e1.message);
  const { error } = await supabase.rpc("community_register", {
    p_key: u.id,
    p_name: clean,
    p_hue: hueFromKey(u.id),
    p_title: null,
  });
  if (error) throw new Error(error.message);
  try {
    localStorage.setItem(`nw_cm_reg_${u.id}`, "1");
  } catch {}
}

export function hueFromKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360;
  return h;
}

// ───────── المستويات ─────────
// نقاط النشاط: منشور 5، تعليق 2، إعجاب مستلم 1، حضور 1
const RANK_STEPS = [0, 20, 60, 150, 400, 1000];
export function rankIndex(points: number): number {
  let r = 0;
  RANK_STEPS.forEach((s, i) => {
    if (points >= s) r = i;
  });
  return r;
}
export function rankName(points: number): string {
  return COPY.ranks[rankIndex(points)];
}

// مستوى المملكة من عدد المنشورات
const KINGDOM_STEPS = [0, 10, 50, 200, 1000];
export function kingdomLevel(posts: number): number {
  let l = 1;
  KINGDOM_STEPS.forEach((s, i) => {
    if (posts >= s) l = i + 1;
  });
  return l;
}

// ───────── تنسيق ─────────
const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatWhen(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, now)) return `اليوم ${hm}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return `أمس ${hm}`;
  if (d.getFullYear() === now.getFullYear()) return `${d.getDate()} ${MONTHS[d.getMonth()]} ${hm}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// 31000 → «31 ألف» ، 1078 → «1078»
export function compactCount(n: number): string {
  if (n >= 10000) {
    const v = Math.round(n / 100) / 10;
    return `${String(v).replace(/\.0$/, "")} ألف`;
  }
  return String(n);
}

// ───────── القراءة ─────────
export type FeedQuery = {
  novelId: number | null;
  tab: TabKey;
  kind: PostKind | "all";
  sort: SortKey;
  from: number;
  q?: string;
};

export async function fetchPosts(q: FeedQuery): Promise<CommunityPost[]> {
  if (!supabase) return [];
  let query = supabase.from("community_posts_public").select("*");
  if (q.novelId != null) query = query.eq("novel_id", q.novelId);
  if (q.tab === "featured") query = query.eq("is_featured", true);
  if (q.tab === "fanwork") query = query.eq("kind", "fanwork");
  if (q.tab === "feed" && q.kind !== "all") query = query.eq("kind", q.kind);
  // المثبّتة تظهر بصف خاص بالأعلى فتُستثنى من القائمة العادية (إلا أثناء البحث)
  if (q.tab === "feed" && !q.q) query = query.eq("is_pinned", false);
  if (q.q) query = query.or(`title.ilike.%${q.q}%,body.ilike.%${q.q}%`);
  const col = q.sort === "newest" ? "created_at" : q.sort === "likes" ? "likes_count" : "last_activity_at";
  query = query.order(col, { ascending: false }).order("id", { ascending: false });
  const { data, error } = await query.range(q.from, q.from + PAGE_SIZE - 1);
  if (error || !data) return [];
  return data as CommunityPost[];
}

export async function fetchPinned(novelId: number | null): Promise<CommunityPost[]> {
  if (!supabase) return [];
  let query = supabase.from("community_posts_public").select("*").eq("is_pinned", true);
  if (novelId != null) query = query.eq("novel_id", novelId);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(5);
  if (error || !data) return [];
  return data as CommunityPost[];
}

export async function fetchPost(id: number): Promise<CommunityPost | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("community_posts_public").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as CommunityPost;
}

export async function fetchComments(postId: number): Promise<CommunityComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_comments_public")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(300);
  if (error || !data) return [];
  return data as CommunityComment[];
}

export async function fetchStats(novelId: number | null): Promise<{ posts: number; members: number }> {
  if (!supabase) return { posts: 0, members: 0 };
  const { data, error } = await supabase.rpc("community_stats", { p_novel_id: novelId });
  if (error || !data) return { posts: 0, members: 0 };
  const d = data as { posts?: number; members?: number };
  return { posts: Number(d.posts ?? 0), members: Number(d.members ?? 0) };
}

export async function fetchMyLikes(ids: number[]): Promise<Set<number>> {
  const u = await sessionUser();
  if (!supabase || !u || ids.length === 0) return new Set();
  const { data, error } = await supabase.rpc("community_my_likes", { p_key: u.id, p_ids: ids });
  if (error || !data) return new Set();
  return new Set((data as unknown[]).map((v) => Number(v)));
}

export async function fetchCheckedIn(novelId: number): Promise<boolean> {
  const u = await sessionUser();
  if (!supabase || !u) return false;
  const { data } = await supabase.rpc("community_checked_in", { p_key: u.id, p_novel_id: novelId });
  return data === true;
}

// ───────── الكتابة ─────────
async function need(): Promise<{ key: string }> {
  return { key: await ensureAuthor() };
}

export async function createPost(input: {
  novelId: number;
  kind: PostKind;
  title: string;
  body: string;
}): Promise<number> {
  const { key } = await need();
  const { data, error } = await supabase!.rpc("community_create_post", {
    p_key: key,
    p_novel_id: input.novelId,
    p_kind: input.kind,
    p_title: input.title,
    p_body: input.body,
  });
  if (error) throw new Error(error.message);
  return Number(data);
}

export async function createComment(postId: number, body: string): Promise<void> {
  const { key } = await need();
  const { error } = await supabase!.rpc("community_create_comment", { p_key: key, p_post_id: postId, p_body: body });
  if (error) throw new Error(error.message);
}

export async function toggleLike(postId: number): Promise<{ liked: boolean; likes: number }> {
  const { key } = await need();
  const { data, error } = await supabase!.rpc("community_toggle_like", { p_key: key, p_post_id: postId });
  if (error) throw new Error(error.message);
  const d = data as { liked: boolean; likes: number };
  return { liked: !!d.liked, likes: Number(d.likes) };
}

export async function checkIn(novelId: number): Promise<void> {
  const { key } = await need();
  const { error } = await supabase!.rpc("community_check_in", { p_key: key, p_novel_id: novelId });
  if (error) throw new Error(error.message);
}

export async function deleteOwnPost(postId: number): Promise<void> {
  const { key } = await need();
  const { error } = await supabase!.rpc("community_delete_own_post", { p_key: key, p_post_id: postId });
  if (error) throw new Error(error.message);
}

export async function deleteOwnComment(commentId: number): Promise<void> {
  const { key } = await need();
  const { error } = await supabase!.rpc("community_delete_own_comment", { p_key: key, p_comment_id: commentId });
  if (error) throw new Error(error.message);
}

// الإشراف
export async function adminCheck(secret: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.rpc("community_admin_check", { p_secret: secret });
  return data === true;
}

export async function adminAction(
  secret: string,
  kind: "post" | "comment",
  id: number,
  action: "pin" | "unpin" | "feature" | "unfeature" | "delete"
): Promise<void> {
  if (!supabase) throw new Error("offline");
  const { error } = await supabase.rpc("community_admin_action", {
    p_secret: secret,
    p_kind: kind,
    p_id: id,
    p_action: action,
  });
  if (error) throw new Error(error.message);
}
