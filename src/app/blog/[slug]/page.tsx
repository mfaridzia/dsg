import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db, ensureDatabaseTables } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_BLOG_POSTS, BlogPost } from "@/lib/data/cmsContent";
import { PRODUCTS } from "@/lib/data/products";
import { formatDate, formatIDR } from "@/lib/utils";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, Sparkles } from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEFAULT_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  await ensureDatabaseTables();

  let post: BlogPost | undefined = DEFAULT_BLOG_POSTS.find((p) => p.slug === slug);
  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (rows.length > 0) {
      const r = rows[0];
      post = {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImageUrl: r.coverImageUrl,
        category: r.category,
        author: { name: r.authorName, role: r.authorRole, avatarUrl: r.authorAvatarUrl },
        publishedAt: new Date(r.publishedAt).toISOString(),
        readTimeMinutes: r.readTimeMinutes,
        linkedProductSlug: r.linkedProductSlug || undefined,
      };
    }
  } catch (err) {
    console.error("Failed to generate metadata for blog:", err);
  }

  if (!post) {
    return { title: "Artikel Tidak Ditemukan — Kodeva" };
  }

  return {
    title: `${post.title} — Kodeva Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImageUrl, width: 1200, height: 630 }],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  await ensureDatabaseTables();

  let post: BlogPost | undefined = DEFAULT_BLOG_POSTS.find((p) => p.slug === slug);
  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (rows.length > 0) {
      const r = rows[0];
      post = {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImageUrl: r.coverImageUrl,
        category: r.category,
        author: { name: r.authorName, role: r.authorRole, avatarUrl: r.authorAvatarUrl },
        publishedAt: new Date(r.publishedAt).toISOString(),
        readTimeMinutes: r.readTimeMinutes,
        linkedProductSlug: r.linkedProductSlug || undefined,
      };
    }
  } catch (err) {
    console.error("Failed to load article from DB:", err);
  }

  if (!post) {
    notFound();
  }

  // Linked product if available
  const linkedProduct = post.linkedProductSlug
    ? PRODUCTS.find((p) => p.slug === post.linkedProductSlug)
    : null;

  return (
    <div className="py-12 sm:py-16 bg-white min-h-screen">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Semua Artikel</span>
          </Link>
        </div>

        {/* Category & Date */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200/80 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTimeMinutes} menit waktu baca
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author Badge */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200">
              <Image
                src={post.author.avatarUrl}
                alt={post.author.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{post.author.name}</div>
              <div className="text-[11px] text-slate-500">{post.author.role}</div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg mb-10 bg-slate-900">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            priority
            unoptimized={post.coverImageUrl.startsWith("data:")}
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Article Body Content */}
        {post.content.includes("<p>") || post.content.includes("<h") ? (
          <div
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:pt-4 [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:pt-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
            {post.content.split("\n\n").map((block, idx) => {
              const lines = block.trim().split("\n");
              if (lines[0].startsWith("### ")) {
                const heading = lines[0].replace("### ", "");
                const rest = lines.slice(1).join(" ");
                return (
                  <div key={idx} className="space-y-2 pt-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {heading}
                    </h3>
                    {rest && <p className="text-slate-600 leading-relaxed">{rest}</p>}
                  </div>
                );
              }
              if (lines[0].startsWith("- ")) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1">
                    {lines.map((li, lidx) => (
                      <li key={lidx}>{li.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx} className="text-slate-600 leading-relaxed">{block}</p>;
            })}
          </div>
        )}

        {/* Linked Product Banner */}
        {linkedProduct && (
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-50 via-sky-50 to-white border-2 border-indigo-200/80 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Solusi Software Terkait</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {linkedProduct.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  {linkedProduct.tagline}
                </p>
                <div className="pt-1 text-xs text-slate-500 font-medium">
                  Mulai dari{" "}
                  <strong className="text-slate-900 font-bold font-mono">
                    {formatIDR(linkedProduct.tiers[0].priceMonthly)}
                  </strong>
                  /bulan • Sisa Kuota Promo:{" "}
                  <strong className="text-indigo-600 font-bold">
                    {linkedProduct.remainingPromoQuota} Lisensi
                  </strong>
                </div>
              </div>

              <Link
                href={`/marketplace/${linkedProduct.slug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Lihat Detail Produk & Paket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
