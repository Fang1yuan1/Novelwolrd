// حماية مسارات الإدارة بالخادم: كلمة سر من متغير ADMIN_API_SECRET (غير كلمة صفحات الإدارة).
import { timingSafeEqual } from "crypto";

export function adminSecretOk(given: string | null | undefined): boolean {
  const secret = process.env.ADMIN_API_SECRET || process.env.REVALIDATE_SECRET;
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
