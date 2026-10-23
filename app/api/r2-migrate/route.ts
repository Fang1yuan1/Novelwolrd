import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { adminSecretOk } from "@/lib/admin-api";
import { chapterKey, r2Configured, r2Get, r2Put } from "@/lib/r2";

export const maxDuration = 60;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null;

const BATCH = 25;
const CONCURRENCY = 5;

type Row = { id: number; chapter_number: number; content: string; word_count: number | null };

// نقل دفعة من فصول رواية إلى R2: يرفع النص، يقرؤه ويقارنه، وفقط عندها يفرّغ عمود content بقاعدة البيانات.
// action = "status" (إحصاء) | "move" (نقل دفعة بعد afterId)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!adminSecretOk(body?.secret)) return NextResponse.json({ ok: false, error: "كلمة سر الإدارة غير صحيحة" }, { status: 401 });
  if (!r2Configured() || !db) return NextResponse.json({ ok: false, error: "R2 أو Supabase غير مُعدّ" }, { status: 500 });

  const novelId = Number(body.novelId);
  if (!Number.isFinite(novelId)) return NextResponse.json({ ok: false, error: "رقم الرواية غير صالح" }, { status: 400 });

  if (body.action === "status") {
    const total = await db.from("chapters").select("id", { count: "exact", head: true }).eq("novel_id", novelId);
    const inDb = await db.from("chapters").select("id", { count: "exact", head: true }).eq("novel_id", novelId).neq("content", "");
    if (total.error || inDb.error) return NextResponse.json({ ok: false, error: (total.error || inDb.error)!.message }, { status: 500 });
    return NextResponse.json({ ok: true, total: total.count ?? 0, inDb: inDb.count ?? 0, inR2: (total.count ?? 0) - (inDb.count ?? 0) });
  }

  if (body.action !== "move") return NextResponse.json({ ok: false, error: "إجراء غير معروف" }, { status: 400 });

  const afterId = Number(body.afterId) || 0;
  const { data, error } = await db
    .from("chapters")
    .select("id, chapter_number, content, word_count")
    .eq("novel_id", novelId)
    .neq("content", "")
    .gt("id", afterId)
    .order("id", { ascending: true })
    .limit(BATCH);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return NextResponse.json({ ok: true, done: true, moved: 0, failed: 0, lastId: afterId });

  let firstMoved = 0;
  // حارس أمان: عند أول دفعة نتأكد أن تفريغ النص لا يصفّر عدّاد الأحرف (يعني ملف SQL التحضيري نُفّذ)
  if (afterId === 0) {
    const probe = rows[0];
    await r2Put(chapterKey(novelId, probe.chapter_number), probe.content);
    const novelBefore = await db.from("novels").select("word_count").eq("id", novelId).single();
    const up = await db.from("chapters").update({ content: "" }).eq("id", probe.id);
    const after = await db.from("chapters").select("word_count").eq("id", probe.id).single();
    const novelAfter = await db.from("novels").select("word_count").eq("id", novelId).single();
    const wcBefore = probe.word_count ?? probe.content.length;
    const wcAfter = (after.data as { word_count: number | null } | null)?.word_count ?? 0;
    const nvBefore = (novelBefore.data as { word_count: number } | null)?.word_count ?? 0;
    const nvAfter = (novelAfter.data as { word_count: number } | null)?.word_count ?? 0;
    if (up.error || (wcBefore > 0 && wcAfter === 0) || nvAfter < nvBefore) {
      await db.from("chapters").update({ content: probe.content }).eq("id", probe.id);
      return NextResponse.json(
        { ok: false, error: "توقّف احترازيًا: شغّل ملف supabase_r2_prepare.sql أولًا (لحماية عدّاد الأحرف). لم يُحذف أي نص." },
        { status: 409 }
      );
    }
    rows.shift();
    firstMoved = 1;
  }

  let moved = firstMoved;
  let failed = 0;
  const errors: string[] = [];
  let i = 0;
  async function worker() {
    while (i < rows.length) {
      const row = rows[i++];
      try {
        const key = chapterKey(novelId, row.chapter_number);
        await r2Put(key, row.content);
        const back = await r2Get(key);
        if (back !== row.content) throw new Error("المقارنة بعد الرفع فشلت");
        const { error: upErr } = await db!.from("chapters").update({ content: "" }).eq("id", row.id);
        if (upErr) throw new Error(upErr.message);
        moved++;
      } catch (e) {
        failed++;
        if (errors.length < 3) errors.push(`فصل ${row.chapter_number}: ${e instanceof Error ? e.message : "خطأ"}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const lastId = (data as Row[])[(data as Row[]).length - 1].id;
  return NextResponse.json({ ok: true, done: (data ?? []).length < BATCH, moved, failed, errors, lastId });
}
