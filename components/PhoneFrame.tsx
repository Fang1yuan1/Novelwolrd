import type { DeviceKind } from "@/lib/device";

/**
 * صفحة الجوال هي الصفحة الأساسية لكل الأجهزة. على الجوال تظهر كما هي،
 * وعلى الآيباد/اللابتوب تظهر بعمود مركزي بعرض ثابت (بدل التمدد على كل الشاشة).
 */
export default function PhoneFrame({
  deviceKind,
  children,
}: {
  deviceKind: DeviceKind;
  children: React.ReactNode;
}) {
  if (deviceKind === "phone") return <>{children}</>;
  return <div className="mx-auto w-full max-w-[640px] bg-white">{children}</div>;
}
