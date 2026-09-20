// أيقونات صفحة الفهرس — SVG متجه مرسوم على أبعاد لقطة المرجع (828 عرض) ومطابق لها بالبكسل.
// كل الأيقونات بتاخد اللون من currentColor، وحجمها بيتحدد من CSS بوحدة u (كلاسات nw-toc-*).
// اتجاه الأسهم الجانبية معكوس (RTL) عشان الموقع بالكامل عربي.

type SvgProps = { className?: string };

// أيقونة التحميل (صندوق بفتحة من فوق + سهم لأسفل) — 36×36 بالمرجع، ورمادي #ccc بجنب كل فصل
export function TocDownloadIcon({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.96"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.88 1.98H6.33A4.35 4.35 0 0 0 1.98 6.33V29.67A4.35 4.35 0 0 0 6.33 34.02H29.67A4.35 4.35 0 0 0 34.02 29.67V6.33A4.35 4.35 0 0 0 29.67 1.98H28.12" />
      <path d="M18 2.15V21.41" />
      <path d="M12.12 16.23L18 21.41L23.88 16.23" />
    </svg>
  );
}

// سهم "إلى النهاية" بالهيدر — 24×26 بالمرجع، أسود #191919
export function TocArrowDownIcon({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 23.74 25.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.04"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M11.87 1.52V23.86" />
      <path d="M1.52 13.58L11.87 23.86L22.22 13.58" />
    </svg>
  );
}

// شيفرون الكبسولة العائمة (سهم صغير لأعلى/لأسفل) — رمادي #adadad
export function TocPillChevron({
  direction,
  className,
}: SvgProps & { direction: "up" | "down" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.56"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {direction === "up" ? (
        <path d="M2.4 7.73L8 2.27L13.6 7.73" />
      ) : (
        <path d="M2.3 2.27L8 7.73L13.7 2.27" />
      )}
    </svg>
  );
}

// سهم الرجوع بالهيدر — 18×32 بالمرجع، أسود #191919 (متجه لليمين لأن الاتجاه RTL)
export function TocBackIcon({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 18.2 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="4.12"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.06 2.06L16.14 16L2.06 29.94" />
    </svg>
  );
}

// شيفرون جنب عنوان الرواية بالشريط الرمادي — 10×18 بالمرجع، رمادي #adadad (متجه لليسار RTL)
export function TocTitleChevron({ className }: SvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 9.85 16.41"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.13"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8.29 1.57L1.57 8.2L8.29 14.85" />
    </svg>
  );
}
