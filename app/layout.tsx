import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Berberim.com | Salonunu dijitale taşı",
  description:
    "Berber, kuaför ve güzellik salonları için online randevu, müşteri ve ekip yönetimi. Berberim ile salonunu 14 gün ücretsiz dene.",
  applicationName: "Berberim.com",
  openGraph: {
    title: "Berberim.com | Salonunu dijitale taşı",
    description:
      "Randevularını, müşterilerini ve ekibini tek bir yerden yönet. Salonuna daha çok zaman, işine daha fazla düzen kazandır.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
