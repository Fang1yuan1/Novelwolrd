// تخزين نصوص الفصول على Cloudflare R2 (متوافق مع S3). يُستخدم من الخادم فقط (مفاتيح الوصول سرّية).
import { AwsClient } from "aws4fetch";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export function r2Configured(): boolean {
  return Boolean(accountId && bucket && accessKeyId && secretAccessKey);
}

let _client: AwsClient | null = null;
function client(): AwsClient {
  if (!r2Configured()) throw new Error("R2 غير مُعدّ (متغيرات البيئة ناقصة)");
  if (!_client) {
    _client = new AwsClient({
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
      service: "s3",
      region: "auto",
    });
  }
  return _client;
}

function urlFor(key: string): string {
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${path}`;
}

// مفتاح ملف الفصل: chapters/{رقم الرواية}/{رقم الفصل}.txt
export function chapterKey(novelId: number | string, chapterNumber: number | string): string {
  return `chapters/${Number(novelId)}/${Number(chapterNumber)}.txt`;
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw last;
}

export async function r2Put(key: string, text: string): Promise<void> {
  await withRetry(async () => {
    const res = await client().fetch(urlFor(key), {
      method: "PUT",
      body: text,
      headers: { "content-type": "text/plain; charset=utf-8" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`R2 PUT ${res.status}`);
  });
}

// يرجع null لو الملف غير موجود
export async function r2Get(key: string): Promise<string | null> {
  return withRetry(async () => {
    const res = await client().fetch(urlFor(key), { method: "GET", cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`R2 GET ${res.status}`);
    return await res.text();
  });
}

export async function r2GetChapter(novelId: number | string, chapterNumber: number | string): Promise<string | null> {
  return r2Get(chapterKey(novelId, chapterNumber));
}

export async function r2Delete(key: string): Promise<void> {
  const res = await client().fetch(urlFor(key), { method: "DELETE", cache: "no-store" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${res.status}`);
}
