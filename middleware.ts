import { NextRequest, NextResponse } from "next/server";

/**
 * حماية بسيطة ضد البوتات والسكربتات اللي بتسحب محتوى الموقع.
 * شغالة على Vercel Edge Runtime — مفيش احتياج لـ Cloudflare.
 *
 * ملاحظة مهمة: التخزين هنا (Map) بيبقى في الذاكرة الخاصة بكل Edge instance،
 * يعني مش 100% دقيق لو الموقع بياخد ترافيك كبير جدًا وعنده instances كتير،
 * لكنه كافي وفعّال لموقع متوسط الحجم. لو الموقع كبر جدًا، الخطوة اللي بعد كده
 * هي Upstash Redis (فيه تكامل جاهز مع Vercel، مجاني لحد حجم معين).
 */

// ==== الإعدادات ====
const RATE_LIMIT_WINDOW_MS = 60_000; // نافذة الدقيقة
const RATE_LIMIT_MAX_REQUESTS = 40; // أقصى عدد طلبات عادية في الدقيقة
const CHAPTER_RATE_LIMIT_MAX = 15; // أقصى عدد صفحات فصول في الدقيقة (أكثر حساسية)
const BLOCK_DURATION_MS = 15 * 60_000; // مدة الحظر المؤقت: 15 دقيقة

// User-Agents معروفة كأدوات سحب آلي (requests, curl, scrapy...الخ)
const BLOCKED_UA_PATTERNS = [
  /python-requests/i,
  /^curl/i,
  /^wget/i,
  /scrapy/i,
  /^java\//i,
  /go-http-client/i,
  /^okhttp/i,
  /axios\/0/i, // بعض إصدارات axios القديمة بتستخدمها سكربتات بسيطة
  /httpclient/i,
  /libwww-perl/i,
  /node-fetch/i,
];

// بوتات محترمة نسمح لها (محركات البحث الحقيقية) — بنتأكد من الـ UA بس هنا،
// للتحقق الكامل من هوية Googlebot الحقيقي محتاج reverse DNS، ده تبسيط عملي
const ALLOWED_BOT_PATTERNS = [/googlebot/i, /bingbot/i, /duckduckbot/i];

type BucketEntry = {
  count: number;
  windowStart: number;
  blockedUntil?: number;
};

// تخزين مؤقت في الذاكرة (per edge instance)
const buckets = new Map<string, BucketEntry>();

// تنظيف دوري بسيط عشان الـ Map متكبرش من غير حدود
function cleanupIfNeeded() {
  if (buckets.size > 5000) {
    const now = Date.now();
    for (const [key, entry] of buckets.entries()) {
      if (
        now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 5 &&
        (!entry.blockedUntil || now > entry.blockedUntil)
      ) {
        buckets.delete(key);
      }
    }
  }
}

function getClientIp(req: NextRequest): string {
  // Vercel بيضيف الهيدر ده تلقائيًا فيه الـ IP الحقيقي للزائر
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isKnownScraperUA(ua: string): boolean {
  if (!ua) return true; // مفيش User-Agent خالص = مشبوه جدًا
  if (ALLOWED_BOT_PATTERNS.some((p) => p.test(ua))) return false;
  return BLOCKED_UA_PATTERNS.some((p) => p.test(ua));
}

function checkRateLimit(
  key: string,
  maxRequests: number
): { allowed: boolean; blocked: boolean } {
  cleanupIfNeeded();
  const now = Date.now();
  const entry = buckets.get(key);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, blocked: true };
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, blocked: false };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    return { allowed: false, blocked: true };
  }

  return { allowed: true, blocked: false };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // فقط: منع أدوات السحب المعروفة فورًا (curl, python-requests...الخ)
  if (isKnownScraperUA(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ✅ تم تعطيل Rate Limiting (الحد من عدد الطلبات)
  // السبب: لتسهيل عمليات الحذف والتعديل في لوحة التحكم
  // إذا احتجت تفعيله لاحقًا، انسخ الكود القديم

  return NextResponse.next();
}

export const config = {
  // شغّل الـ middleware على كل حاجة ما عدا static files و _next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
