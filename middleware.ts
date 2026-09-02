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
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";

  // 1) امنع أدوات السحب المعروفة فورًا (curl, python-requests...الخ)
  if (isKnownScraperUA(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2) Honeypot: أي زيارة لمسار الفخ تعني إنه بوت 100% — حظر فوري
  if (pathname === "/api/internal/sitemap-trap") {
    buckets.set(`ip:${ip}`, {
      count: RATE_LIMIT_MAX_REQUESTS + 1,
      windowStart: Date.now(),
      blockedUntil: Date.now() + BLOCK_DURATION_MS * 4, // حظر أطول للي وقع في الفخ
    });
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3) Rate limiting عام على كل حاجة
  const generalCheck = checkRateLimit(`ip:${ip}`, RATE_LIMIT_MAX_REQUESTS);
  if (!generalCheck.allowed) {
    return new NextResponse("عدد الطلبات كتير أوي، حاول تاني بعد شوية", {
      status: 429,
      headers: { "Retry-After": "900" },
    });
  }

  // 4) Rate limiting أشد على صفحات الفصول تحديدًا (أعلى قيمة محتوى)
  const isChapterPage = /^\/novel\/[^/]+\/chapter\/[^/]+$/.test(pathname);
  if (isChapterPage) {
    const chapterCheck = checkRateLimit(
      `chapter:${ip}`,
      CHAPTER_RATE_LIMIT_MAX
    );
    if (!chapterCheck.allowed) {
      return new NextResponse(
        "بطّئ شوية في قراءة الفصول 🙂 حاول تاني بعد دقايق",
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // شغّل الـ middleware على كل حاجة ما عدا static files و _next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
