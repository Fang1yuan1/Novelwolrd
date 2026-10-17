import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/lib/auth";
import NavTracker from "@/components/NavTracker";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "عالم الروايات — اقرأ الروايات المترجمة",
    template: "%s — عالم الروايات",
  },
  description: "اقرأ آلاف الفصول من الروايات المترجمة إلى العربية: خيال وفنون قتالية وحياة حضرية وغيرها، مع مملكة قرّاء لكل رواية.",
  applicationName: "عالم الروايات",
  openGraph: {
    type: "website",
    siteName: "عالم الروايات",
    locale: "ar_AR",
    url: SITE_URL,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#eef0f1",
  viewportFit: "cover",
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
      <body className="antialiased">
        <AuthProvider>
          <NavTracker />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
