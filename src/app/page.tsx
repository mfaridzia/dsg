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

export default async function HomePage() {
  await ensureDatabaseTables();

  let hero = DEFAULT_LANDING_CONTENT.hero;
  let faqs = DEFAULT_LANDING_CONTENT.faqs;
  let testimonials = DEFAULT_LANDING_CONTENT.testimonials;

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
    }
  } catch (err) {
    console.error("Failed to read dynamic landing content:", err);
  }

  const featured = PRODUCTS.filter((p) =>
    DEFAULT_LANDING_CONTENT.featuredProductIds.includes(p.id)
  );

  return (
    <div>
      <HeroSection content={hero} />
      <FeaturedProducts products={featured} />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection faqs={faqs} />
      <LeadCaptureForm />
    </div>
  );
}
