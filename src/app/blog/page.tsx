import { db, ensureDatabaseTables } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DEFAULT_BLOG_POSTS, BlogPost } from "@/lib/data/cmsContent";
import { BlogListClient } from "@/components/blog/BlogListClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  await ensureDatabaseTables();

  let posts: BlogPost[] = DEFAULT_BLOG_POSTS;

  try {
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts = rows.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImageUrl: r.coverImageUrl,
        category: r.category,
        author: {
          name: r.authorName,
          role: r.authorRole,
          avatarUrl: r.authorAvatarUrl,
        },
        publishedAt: new Date(r.publishedAt).toISOString().split("T")[0],
        readTimeMinutes: r.readTimeMinutes,
        linkedProductSlug: r.linkedProductSlug || undefined,
      }));
    }
  } catch (err) {
    console.error("Failed to load blog posts from DB:", err);
  }

  return <BlogListClient initialPosts={posts} />;
}
