import type { Metadata } from "next";
import { db, ensureDatabaseTables } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DEFAULT_BLOG_POSTS, BlogPost } from "@/lib/data/cmsContent";
import { BlogListClient } from "@/components/blog/BlogListClient";

export const metadata: Metadata = {
  title: "Pusat Edukasi & Blog Bisnis UMKM — Kodeva",
  description:
    "Kumpulan panduan praktis memilih aplikasi kasir cafe/resto, tutorial perhitungan PPh 21 TER, strategi manajemen stok, dan tips efisiensi operasional bisnis.",
  keywords: [
    "blog aplikasi kasir",
    "panduan aplikasi hr",
    "tips bisnis umkm",
    "tutorial pph 21 ter",
    "efisiensi kasir restoran",
  ],
  openGraph: {
    title: "Pusat Edukasi & Panduan Bisnis UMKM — Kodeva Blog",
    description:
      "Pelajari panduan memilih aplikasi kasir, tips HR payroll, dan strategi efisiensi operasional UMKM Indonesia.",
    url: "/blog",
    siteName: "Kodeva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Panduan Edukasi Bisnis Kodeva",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pusat Edukasi & Panduan Bisnis UMKM — Kodeva Blog",
    description:
      "Pelajari panduan memilih aplikasi kasir, tips HR payroll, dan strategi efisiensi operasional UMKM Indonesia.",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

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
