import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCartButton } from "@/components/layout/FloatingCartButton";
import { DataLayerInspector } from "@/components/marketing/DataLayerInspector";
import { UtmTracker } from "@/components/marketing/UtmTracker";

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
  title: "Kodeva — Software Bisnis & Kasir Cloud untuk UMKM Indonesia",
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
    url: "https://kodeva.dsg.id",
    siteName: "Kodeva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <UtmTracker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingCartButton />
        <DataLayerInspector />
      </body>
    </html>
  );
}
