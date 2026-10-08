import { headers } from "next/headers";
import { classifyUserAgent, type DeviceKind } from "./device";

/**
 * نفس تحديد الجهاز (lib/device.ts) لكن بمكوّنات السيرفر (Server Components):
 * يقرأ الـUser-Agent الحقيقي من طلب الصفحة نفسه قبل أي رسم (مافي "وميض"
 * بين نسخة الجوال ونسخة الشاشة الكبيرة زي ما يصير مع CSS breakpoints).
 */
export async function getServerDeviceKind(): Promise<DeviceKind> {
  const h = await headers();
  const ua = h.get("user-agent") || "";
  return classifyUserAgent(ua);
}

export async function isPhoneServer(): Promise<boolean> {
  return (await getServerDeviceKind()) === "phone";
}
