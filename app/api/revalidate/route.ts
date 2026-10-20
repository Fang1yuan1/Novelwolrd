import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// تحديث فوري لصفحات مخزّنة (ISR) بعد تعديل فصل أو رفع فصول:
//   https://www.novelwolrd.com/api/revalidate?secret=كلمتك&path=/novel/50
//   path=/novel/50  ← صفحة الرواية     path=/novel/50/toc ← فهرسها     path=all ← كل الموقع (استعملها نادرًا)
// يحتاج متغير REVALIDATE_SECRET بإعدادات Vercel (Environment Variables)، وبدونه المسار معطّل.
export async function GET(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.nextUrl.searchParams.get("secret");
  if (!secret || given !== secret) return NextResponse.json({ ok: false }, { status: 401 });

  const path = req.nextUrl.searchParams.get("path") || "/";
  if (path === "all") revalidatePath("/", "layout");
  else if (path.startsWith("/")) revalidatePath(path);
  else return NextResponse.json({ ok: false, error: "bad path" }, { status: 400 });
  return NextResponse.json({ ok: true, path });
}
