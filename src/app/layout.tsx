import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCartButton } from "@/components/layout/FloatingCartButton";
import { UtmTracker } from "@/components/marketing/UtmTracker";
import { DataLayerInspector } from "@/components/marketing/DataLayerInspector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dsg-kodeva.vercel.app"),
  title: {
    default: "Kodeva — Software Bisnis & Kasir Cloud untuk UMKM Indonesia",
    template: "%s | Kodeva",
  },
  description:
    "Otomatisasi aplikasi kasir POS, sistem HR & payroll PPh 21, dan kontrol inventori multi-cabang. Amankan promo akhir tahun diskon s/d 45% sekarang.",
  keywords: [
    "aplikasi kasir",
    "aplikasi kasir online",
    "aplikasi HR payroll",
    "software akuntansi umkm",
    "kodeva",
    "promo akhir tahun",
  ],
  openGraph: {
    title: "Kodeva — Solusi Cloud Bisnis Terpadu UMKM",
    description: "Promo Akhir Tahun: Diskon Lisensi Software Kasir & HR hingga 45%.",
    url: "https://dsg-kodeva.vercel.app",
    siteName: "Kodeva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&h=420&q=65",
        width: 800,
        height: 420,
        alt: "Kodeva Cloud Business Platform",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kodeva — Software Bisnis UMKM",
    description: "Promo Akhir Tahun: Diskon Lisensi Software Kasir & HR hingga 45%.",
    images: [
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&h=420&q=65",
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <QueryProvider>
          <Toaster richColors position="top-right" closeButton />
          <UtmTracker />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCartButton />
          <DataLayerInspector />
        </QueryProvider>
      </body>
    </html>
  );
}
