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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
