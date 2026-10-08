import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseTables } from "@/db";
import { landingContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await ensureDatabaseTables();
    const rows = await db.select().from(landingContent).where(eq(landingContent.id, "main"));

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      success: true,
      data: {
        hero: {
          badge: row.heroBadge,
          title: row.heroTitle,
          subtitle: row.heroSubtitle,
          heroImageUrl: row.heroImageUrl,
          ctaPrimaryText: row.ctaPrimaryText,
          ctaPrimaryLink: row.ctaPrimaryLink,
          ctaSecondaryText: row.ctaSecondaryText,
          ctaSecondaryLink: row.ctaSecondaryLink,
          highlights: [
            "Dipercaya 14.500+ UMKM di 34 Provinsi",
            "Siap Digunakan dalam 10 Menit",
            "Garansi Dukungan Teknis 7 Hari Seminggu",
          ],
        },
        faqs: JSON.parse(row.faqsJson),
        testimonials: JSON.parse(row.testimonialsJson),
        promoSchedule: row.promoScheduleJson
          ? JSON.parse(row.promoScheduleJson)
          : undefined,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err: unknown) {
    console.error("[Get Landing Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to load content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseTables();
    const body = await req.json();

    const { hero, faqs, testimonials, promoSchedule } = body;

    await db
      .update(landingContent)
      .set({
        heroBadge: hero.badge || "",
        heroTitle: hero.title,
        heroSubtitle: hero.subtitle,
        heroImageUrl: hero.heroImageUrl,
        ctaPrimaryText: hero.ctaPrimaryText,
        ctaPrimaryLink: hero.ctaPrimaryLink,
        ctaSecondaryText: hero.ctaSecondaryText,
        ctaSecondaryLink: hero.ctaSecondaryLink,
        faqsJson: JSON.stringify(faqs),
        testimonialsJson: JSON.stringify(testimonials),
        promoScheduleJson: promoSchedule ? JSON.stringify(promoSchedule) : null,
        updatedAt: new Date(),
      })
      .where(eq(landingContent.id, "main"));

    // Instant On-Demand Revalidation
    revalidatePath("/", "page");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Konten beranda berhasil diperbarui dan direvalidasi seketika!",
    });
  } catch (err: unknown) {
    console.error("[Update Landing Error]:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update content" },
      { status: 500 }
    );
  }
}
