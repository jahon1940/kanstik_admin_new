import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import I18nProvider from "@/components/I18nProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanstik admin",
  description:
    "Tovarlar, mijozlar, kassa, moliya va boshqa ko'p ma'lumotlarni hisobga olish - barchasi bitta oddiy va qulay dasturda",
  icons: {
    icon: "/favicon.png", // PNG favicon
  },
  openGraph: {
    title: "Kanstik admin",
    description:
      "Tovarlar, mijozlar, kassa, moliya va boshqa ko'p ma'lumotlarni hisobga olish - barchasi bitta oddiy va qulay dasturda",
    url: "https://Kanstik-service.vercel.app/",
    siteName: "Kanstik service",
    images: [
      {
        url: "/favicon.png", // Telegramda ko‘rinadigan rasm
        width: 600,
        height: 315,
        alt: "Kanstik img",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kanstik admin",
    description:
      "Tovarlar, mijozlar, kassa, moliya va boshqa ko'p ma'lumotlarni hisobga olish - barchasi bitta oddiy va qulay dasturda",
    images: ["/favicon.png"],
  },
  other: {
    author: "Abbosbek Qodirov", // shu yerda yoziladi
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bgColor`}
      >
        <I18nProvider>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
