// غلاف لكل صفحات الموقع العامة (غير الأدمن) — نفس تصميم الهاتف بالضبط يظهر
// بعرض هاتف ثابت وبمنتصف الشاشة حتى على الشاشات الكبيرة (آيباد/لابتوب)، بدل
// وجود تصميم "غني" منفصل للشاشات الكبيرة. الهدف: نظام واجهة واحد فقط بالموقع.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#e5e5e5] sm:py-6">
      <div className="mx-auto min-h-screen w-full max-w-[480px] bg-surface sm:min-h-0 sm:shadow-[0_0_40px_rgba(0,0,0,0.12)]">
        {children}
      </div>
    </div>
  );
}
