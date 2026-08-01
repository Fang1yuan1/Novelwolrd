import { sisterSites } from "@/lib/placeholder-data";

const footerColumns = [
  {
    heading: "من نحن",
    links: ["نبذة عن الشركة", "الوظائف", "غرفة الصحافة", "تواصل معنا"],
  },
  {
    heading: "للقرّاء",
    links: ["مركز المساعدة", "تحميل التطبيق", "العضوية", "بطاقات الهدايا"],
  },
  {
    heading: "للكتّاب",
    links: ["مساحة عمل الكاتب", "دليل النشر", "الأرباح", "المجتمع"],
  },
  {
    heading: "قانوني",
    links: ["شروط الخدمة", "سياسة الخصوصية", "حماية القاصرين", "الإبلاغ عن محتوى"],
  },
];

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-ink-300/20 bg-white">
      <div className="mx-auto max-w-shell px-3 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <p className="mb-1.5 text-sm font-semibold text-ink-900">
                {col.heading}
              </p>
              <ul className="space-y-2 text-[11px] text-ink-500">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-brand">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* المواقع الشقيقة */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-ink-300/20 pt-6 text-center text-[11px] text-ink-500">
          {sisterSites.map((site, i) => (
            <span key={site} className="flex items-center gap-2">
              <a href="#" className="hover:text-brand">
                {site}
              </a>
              {i < sisterSites.length - 1 && (
                <span className="text-ink-300" aria-hidden>
                  |
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center text-[11px] text-ink-300">
          <span>من نحن</span>
          <span>تواصل معنا</span>
          <span>الوظائف</span>
          <span>مركز المساعدة</span>
          <span>الإبلاغ عن مشكلة</span>
          <span>الإفصاح عن ثغرة أمنية</span>
        </div>

        <div className="mt-2 text-center text-[11px] leading-relaxed text-ink-300">
          <p>جميع الحقوق محفوظة © 2002–{new Date().getFullYear()} — هذا تخطيط تجريبي فقط، لا يحتوي على أي أرقام تسجيل حقيقية.</p>
          <p>
            كل الأعمال المرفوعة من المستخدمين هي مسؤولية من رفعها؛ يُرجى
            الإبلاغ عن أي محتوى ينتهك حقوق أصحابه.
          </p>
        </div>

        {/* شارات التصديق الفارغة */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {["أمن الشبكة", "توثيق الهوية", "تحالف مكافحة القرصنة", "مركز الإبلاغ"].map(
            (label) => (
              <span
                key={label}
                className="ph-block flex h-10 w-28 items-center justify-center rounded text-[10px]"
              >
                {label}
              </span>
            )
          )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 border-t border-ink-300/20 pt-6 text-center text-[11px] text-ink-300 sm:flex-row sm:justify-between sm:text-start">
          <p>
            هذه الصفحة نموذج تخطيط أمامي تجريبي. كل الأسماء وأغلفة الكتب
            والأرقام المعروضة محتوى بديل ولا تمثّل أي منشور حقيقي.
          </p>
          <p>© {new Date().getFullYear()} نوفل هَب — نموذج تجريبي. ليست خدمة فعلية.</p>
        </div>
      </div>
    </footer>
  );
}
