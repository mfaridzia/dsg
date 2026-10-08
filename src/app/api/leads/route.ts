import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, ensureLeadsTable } from "@/db";
import { leads } from "@/db/schema";
import { nanoid } from "nanoid";

const leadSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  whatsapp: z.string().min(8, "Nomor WhatsApp tidak valid"),
  company: z.string().optional(),
  interest: z.string().optional(),
  // Anti-spam honeypot: must be empty for real humans
  website: z.string().max(0, "Bot detected").optional(),
  // Anti-spam timestamp: human takes at least 1.5 seconds to fill form
  renderedAt: z.number().optional(),
  // UTM Attribution
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Anti-spam: Honeypot check
    if (data.website && data.website.length > 0) {
      console.warn("[Anti-Spam] Honeypot triggered, discarding bot submission.");
      return NextResponse.json(
        { success: true, message: "Terima kasih!" }, // silent reject
        { status: 200 }
      );
    }

    // 2. Anti-spam: Submission time check (if renderedAt provided)
    if (data.renderedAt && Date.now() - data.renderedAt < 1200) {
      console.warn("[Anti-Spam] Bot submission too fast (< 1.2s), rejecting.");
      return NextResponse.json(
        { success: false, error: "Terlalu cepat mengisi formulir. Silakan coba lagi." },
        { status: 400 }
      );
    }

    // Ensure database table exists
    await ensureLeadsTable();

    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      company: data.company || null,
      interest: data.interest || "Konsultasi Umum Promo Akhir Tahun",
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      utmContent: data.utmContent || null,
      utmTerm: data.utmTerm || null,
      createdAt: new Date(),
    };

    await db.insert(leads).values(newLead);

    return NextResponse.json({
      success: true,
      message: "Data leads berhasil disimpan.",
      leadId: newLead.id,
    });
  } catch (error) {
    console.error("[Leads API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data lead. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureLeadsTable();
    const allLeads = await db.select().from(leads);
    return NextResponse.json({ success: true, data: allLeads });
  } catch (error) {
    console.error("[Get Leads Error]:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data leads" },
      { status: 500 }
    );
  }
}
