import type { Metadata } from "next";
import { db, ensureDatabaseTables } from "@/db";
import { landingContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_LANDING_CONTENT } from "@/lib/data/cmsContent";
import { PRODUCTS } from "@/lib/data/products";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedProducts } from "@/components/landing/FeaturedProducts";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { LeadCaptureForm } from "@/components/landing/LeadCaptureForm";

export const metadata: Metadata = {
  title: "Kodeva — Solusi Software Kasir & HR Cloud Terintegrasi UMKM",
  description:
    "Otomatisasi aplikasi kasir POS, sistem payroll PPh 21, dan kontrol inventori multi-cabang. Amankan promo akhir tahun diskon s/d 45% sekarang.",
  keywords: [
    "aplikasi kasir",
    "aplikasi kasir online",
    "software POS",
    "aplikasi HR",
    "software payroll umkm",
    "kodeva",
  ],
  openGraph: {
    title: "Kodeva — Solusi Software Kasir & HR Cloud Terintegrasi UMKM",
    description:
      "Otomatisasi kasir, payroll karyawan, dan stok usaha tanpa ribet. Promo diskon lisensi s/d 45% + gratis setup cabang.",
    url: "/",
    siteName: "Kodeva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&h=420&q=65",
        width: 800,
        height: 420,
        alt: "Dashboard Aplikasi Kasir & HR Kodeva",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kodeva — Solusi Software Kasir & HR Cloud Terintegrasi UMKM",
    description:
      "Otomatisasi kasir, payroll karyawan, dan stok usaha tanpa ribet. Promo diskon lisensi s/d 45%.",
    images: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&h=420&q=65",
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDatabaseTables();

  let hero = DEFAULT_LANDING_CONTENT.hero;
  let faqs = DEFAULT_LANDING_CONTENT.faqs;
  let testimonials = DEFAULT_LANDING_CONTENT.testimonials;
  let promoSchedule = DEFAULT_LANDING_CONTENT.promoSchedule;

  try {
    const rows = await db.select().from(landingContent).where(eq(landingContent.id, "main"));
    if (rows.length > 0) {
      const row = rows[0];
      hero = {
        badge: row.heroBadge,
        title: row.heroTitle,
        subtitle: row.heroSubtitle,
        heroImageUrl: row.heroImageUrl,
        ctaPrimaryText: row.ctaPrimaryText,
        ctaPrimaryLink: row.ctaPrimaryLink,
        ctaSecondaryText: row.ctaSecondaryText,
        ctaSecondaryLink: row.ctaSecondaryLink,
        highlights: DEFAULT_LANDING_CONTENT.hero.highlights,
      };
      faqs = JSON.parse(row.faqsJson);
      testimonials = JSON.parse(row.testimonialsJson);
      if (row.promoScheduleJson) {
        try {
          promoSchedule = JSON.parse(row.promoScheduleJson);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error("Failed to read dynamic landing content:", err);
  }

  const featured = PRODUCTS.filter((p) =>
    DEFAULT_LANDING_CONTENT.featuredProductIds.includes(p.id)
  );

  return (
    <div>
      <HeroSection content={hero} promoSchedule={promoSchedule} />
      <FeaturedProducts products={featured} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <LeadCaptureForm />
    </div>
  );
}
