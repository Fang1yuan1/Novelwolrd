import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "عالم الروايات — بوابة القراءة (نموذج واجهة تجريبي)",
  description:
    "تخطيط واجهة أمامية تجريبي مستوحى من بنية الصفحة الرئيسية لبوابة قراءة روايات. كل النصوص والشعارات والصور محتوى بديل (Placeholder).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
