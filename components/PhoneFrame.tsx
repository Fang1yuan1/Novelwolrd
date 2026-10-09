import type { DeviceKind } from "@/lib/device";

/**
 * صفحة الجوال هي الصفحة الأساسية لكل الأجهزة. على الجوال (أقل من 640px) تظهر كما هي،
 * وعلى الشاشات الأكبر تظهر بعمود مركزي بعرض ثابت. صارت بالـCSS فقط (بدون قراءة User-Agent
 * بالسيرفر) عشان تقدر الصفحات تكون مخزّنة (ISR) وتُخدم بدون تشغيل دالة لكل زيارة.
 */
export default function PhoneFrame({
  children,
}: {
  deviceKind?: DeviceKind;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[640px] min-[641px]:bg-white">{children}</div>
  );
}
