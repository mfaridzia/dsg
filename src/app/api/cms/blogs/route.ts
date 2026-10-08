import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseTables } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await ensureDatabaseTables();
    const rows = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
    return NextResponse.json({ success: true, data: rows });
  } catch (err: unknown) {
    console.error("[Get Blogs Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseTables();
    const body = await req.json();

    const {
      id,
      title,
      slug,
      category,
      excerpt,
      content,
      coverImageUrl,
      authorName,
      authorRole,
      authorAvatarUrl,
      linkedProductSlug,
      status,
    } = body;

    const postSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const existing = id
      ? await db.select().from(blogPosts).where(eq(blogPosts.id, id))
      : [];

    if (existing.length > 0) {
      // Update existing post
      await db
        .update(blogPosts)
        .set({
          title,
          slug: postSlug,
          category,
          excerpt,
          content,
          coverImageUrl: coverImageUrl || existing[0].coverImageUrl,
          authorName: authorName || existing[0].authorName,
          authorRole: authorRole || existing[0].authorRole,
          authorAvatarUrl: authorAvatarUrl || existing[0].authorAvatarUrl,
          linkedProductSlug: linkedProductSlug || null,
          status: status || "published",
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, id));
    } else {
      // Insert new post
      const newId = `blog_${Date.now()}`;
      await db.insert(blogPosts).values({
        id: newId,
        slug: postSlug,
        title,
        category,
        excerpt,
        content,
        coverImageUrl:
          coverImageUrl ||
          "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
        authorName: authorName || "Tim Editorial Kodeva",
        authorRole: authorRole || "Author & Editor",
        authorAvatarUrl:
          authorAvatarUrl ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        readTimeMinutes: Math.max(
          3,
          Math.ceil(content.split(" ").length / 150),
        ),
        linkedProductSlug: linkedProductSlug || null,
        status: status || "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Revalidate blog pages
    revalidatePath("/blog", "page");
    revalidatePath(`/blog/${postSlug}`, "page");
    revalidatePath(`/blog/preview/${postSlug}`, "page");
    revalidatePath("/", "page");

    return NextResponse.json({
      success: true,
      message: "Artikel blog berhasil disimpan dan langsung direvalidasi!",
    });
  } catch (err: unknown) {
    console.error("[Save Blog Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save blog post",
      },
      { status: 500 },
    );
  }
}

// Handle PUT method for editing articles (prevents 405 Method Not Allowed)
export const PUT = POST;

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    await ensureDatabaseTables();
    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    revalidatePath("/blog", "page");
    revalidatePath("/", "page");
    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (err: unknown) {
    console.error("[Delete Blog Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 },
    );
  }
}
