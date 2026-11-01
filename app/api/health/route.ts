import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// فحص سريع للاتصال بـSupabase بدون كشف أي قيمة: https://موقعك/api/health
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const info: Record<string, unknown> = {
    supabaseUrlSet: Boolean(url),
    supabaseUrlLooksOk: /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url ?? ""),
    anonKeySet: Boolean(key),
    anonKeyPrefix: key ? key.slice(0, 12) : null,
  };
  if (url && key) {
    try {
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { count, error } = await db.from("novels").select("id", { count: "exact", head: true });
      info.novels = count ?? null;
      info.error = error?.message ?? null;
    } catch (e) {
      info.error = e instanceof Error ? e.message : "خطأ";
    }
  }
  return NextResponse.json(info);
}
