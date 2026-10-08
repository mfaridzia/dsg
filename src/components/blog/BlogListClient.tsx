"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/data/cmsContent";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, Clock, ArrowRight, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics/dataLayer";

const POSTS_PER_PAGE = 3;

interface BlogListClientProps {
  initialPosts: BlogPost[];
}

export function BlogListClient({ initialPosts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = [
    "Semua",
    ...Array.from(new Set(initialPosts.map((p) => p.category))),
  ];

  const filteredPosts =
    selectedCategory === "Semua"
      ? initialPosts
      : initialPosts.filter((p) => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const displayedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    trackCtaClick(`blog_filter_${cat}`, "blog_list_category_filter");
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pusat Edukasi & Insight Bisnis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Panduan & Strategi Praktis Mengembangkan Usaha
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Pelajari tips pengelolaan kasir outlet, regulasi perpajakan PPh 21 TER, manajemen persediaan barang, dan strategi omzet untuk pemilik UMKM.
          </p>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  {post.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTimeMinutes} mnt baca
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      onClick={() =>
                        trackCtaClick(`open_blog_${post.slug}`, "blog_card_title")
                      }
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-200">
                      <Image
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">
                      {post.author.name}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    onClick={() =>
                      trackCtaClick(`read_article_${post.slug}`, "blog_card_footer")
                    }
                    className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Baca</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Control */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
