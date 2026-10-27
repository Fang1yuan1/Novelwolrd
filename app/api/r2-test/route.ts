import { NextRequest, NextResponse } from "next/server";
import { adminSecretOk } from "@/lib/admin-api";
import { r2Configured, r2Delete, r2Diagnostics, r2Get, r2Put } from "@/lib/r2";

export const maxDuration = 30;

// فحص الاتصال بـR2: يكتب ملفًا تجريبيًا ثم يقرؤه ثم يحذفه.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!adminSecretOk(body?.secret)) return NextResponse.json({ ok: false, error: "كلمة سر الإدارة غير صحيحة (أو ADMIN_API_SECRET غير مضبوط)" }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ ok: false, error: "متغيرات R2 ناقصة بإعدادات Vercel", diag: r2Diagnostics() }, { status: 500 });
  try {
    const key = `test/ping-${Date.now()}.txt`;
    const text = "اختبار الاتصال ✓ " + new Date().toISOString();
    await r2Put(key, text);
    const back = await r2Get(key);
    await r2Delete(key);
    return NextResponse.json({ ok: back === text, wrote: text.length, read: back?.length ?? null });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "خطأ", diag: r2Diagnostics() }, { status: 500 });
  }
}
