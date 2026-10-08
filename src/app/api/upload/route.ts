import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { isR2Configured, uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File harus berupa gambar (JPG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || ".jpg";
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const fileName = `${Date.now()}-${cleanBase}${ext}`;

    // 1. Prioritize Cloudflare R2 if configured
    if (isR2Configured) {
      try {
        const r2Url = await uploadToR2({
          fileBuffer: buffer,
          fileName,
          contentType: file.type || "image/jpeg",
        });

        return NextResponse.json({
          success: true,
          url: r2Url,
        });
      } catch (r2Err) {
        console.error("[Upload to Cloudflare R2 Error]:", r2Err);
        // continue to fallback below
      }
    }

    // 2. Fallback to local disk (development)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
      });
    } catch (writeErr) {
      console.warn("[Upload to Disk Fallback to Data URL]:", writeErr);
      // 3. Fallback to Data URL for serverless without R2 / readonly environments
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
      });
    }
  } catch (err: unknown) {
    console.error("[Upload Error]:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengunggah gambar" },
      { status: 500 }
    );
  }
}
