import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Software Bisnis & Promo Lisensi — Kodeva Marketplace",
  description:
    "Pilihan software bisnis resmi: Aplikasi Kasir POS Toko/F&B, Sistem HR & Payroll PPh 21, dan Manajemen Stok Multi-Cabang. Amankan kuota diskon lisensi promo terbatas hingga 45%.",
  keywords: [
    "katalog software kasir",
    "beli lisensi pos",
    "software hr payroll indonesia",
    "aplikasi kasir murah",
    "marketplace software umkm",
    "promo lisensi kodeva",
  ],
  openGraph: {
    title: "Katalog Software Bisnis & Promo Lisensi — Kodeva Marketplace",
    description:
      "Pilihan software kasir POS, sistem HR payroll, dan stok barang. Dapatkan diskon kuota promo lisensi s/d 45% hari ini.",
    url: "/marketplace",
    siteName: "Kodeva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&h=420&q=65",
        width: 800,
        height: 420,
        alt: "Katalog Software Kodeva Marketplace",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Software Bisnis & Promo Lisensi — Kodeva Marketplace",
    description:
      "Pilihan software kasir POS, sistem HR payroll, dan stok barang. Diskon lisensi s/d 45%.",
    images: [
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&h=420&q=65",
    ],
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
