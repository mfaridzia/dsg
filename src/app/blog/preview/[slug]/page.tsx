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
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Tag,
  Sparkles,
  Eye,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";

interface BlogPreviewPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `[Preview] ${slug} — Kodeva Admin Preview`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  const { slug } = await params;
  await ensureDatabaseTables();

  let post: (BlogPost & { status?: string }) | undefined = DEFAULT_BLOG_POSTS.find(
    (p) => p.slug === slug
  );
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
        author: {
          name: r.authorName,
          role: r.authorRole,
          avatarUrl: r.authorAvatarUrl,
        },
        publishedAt: new Date(r.publishedAt).toISOString(),
        readTimeMinutes: r.readTimeMinutes,
        linkedProductSlug: r.linkedProductSlug || undefined,
        status: r.status,
      };
    }
  } catch (err) {
    console.error("Failed to load article preview from DB:", err);
  }

  if (!post) {
    notFound();
  }

  const isPublished = post.status === "published";
  const linkedProduct = post.linkedProductSlug
    ? PRODUCTS.find((p) => p.slug === post.linkedProductSlug)
    : null;

  return (
    <div className="bg-white min-h-screen">
      {/* 1. TOP PREVIEW BANNER (Editor Mode Indicator) */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-white">
                Mode Pratinjau Draf Artikel
              </span>
              <span className="text-slate-400 hidden sm:inline ml-1.5">
                • Halaman ini tidak terindeks oleh mesin pencari Google
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-1 ${
                isPublished
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {post.status || "draft"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kembali ke Admin</span>
            </Link>

            {isPublished && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
              >
                <span>Buka Versi Publik</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. ARTICLE CONTENT (Mirror of /blog/[slug]) */}
      <div className="py-10 sm:py-14">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Blog */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Blog Publik</span>
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

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {post.excerpt}
            </p>

            {/* Author Profile Card */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                <Image
                  src={
                    post.author.avatarUrl ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={post.author.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {post.author.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {post.author.role}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Cover Image */}
          <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden mb-10 shadow-lg border border-slate-100 bg-slate-100">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          {/* Rich Content Body */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-indigo-600 prose-a:underline hover:prose-a:text-indigo-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Linked Product Banner */}
          {linkedProduct && (
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Rekomendasi Software Terkait Artikel</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {linkedProduct.name}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl">
                    {linkedProduct.tagline}
                  </p>
                  <div className="text-xs font-semibold text-emerald-700 pt-1">
                    Mulai dari {formatIDR(linkedProduct.tiers[0].priceMonthly)}
                    /bulan • Sisa kuota promo: {linkedProduct.remainingPromoQuota} lisensi
                  </div>
                </div>
                <Link
                  href={`/marketplace/${linkedProduct.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition shrink-0"
                >
                  <span>Lihat Detail & Promo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
