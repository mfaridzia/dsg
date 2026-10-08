"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS } from "@/lib/data/products";
import { formatIDR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import {
  Filter,
  Flame,
  Sparkles,
  ArrowRight,
  Check,
  Search,
  ArrowUpDown,
  X,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function MarketplaceCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL search params
  const initialCategory = searchParams.get("category") || "Semua";
  const initialSort = searchParams.get("sort") || "featured";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [copiedLink, setCopiedLink] = useState(false);

  const getEffectivePoolQuota = useCartStore((state) => state.getEffectivePoolQuota);

  const categories = [
    "Semua",
    "Kasir & POS",
    "SDM & Payroll",
    "Operasional & Stok",
    "Add-On",
  ];

  // Synchronize state changes to URL query params (shareable URLs)
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "Semua") {
      params.set("category", selectedCategory);
    }
    if (selectedSort && selectedSort !== "featured") {
      params.set("sort", selectedSort);
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    const queryStr = params.toString();
    const newUrl = queryStr ? `/marketplace?${queryStr}` : `/marketplace`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, selectedSort, searchQuery, router]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // 1. Filter by category
    if (selectedCategory !== "Semua") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 3. Sort products
    if (selectedSort === "price_asc") {
      result.sort((a, b) => {
        const minA = Math.min(...a.tiers.map((t) => t.priceMonthly));
        const minB = Math.min(...b.tiers.map((t) => t.priceMonthly));
        return minA - minB;
      });
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => {
        const minA = Math.min(...a.tiers.map((t) => t.priceMonthly));
        const minB = Math.min(...b.tiers.map((t) => t.priceMonthly));
        return minB - minA;
      });
    } else if (selectedSort === "discount") {
      result.sort((a, b) => {
        const discA = Math.max(
          ...a.tiers.map(
            (t) => (t.originalPriceMonthly - t.priceMonthly) / t.originalPriceMonthly
          )
        );
        const discB = Math.max(
          ...b.tiers.map(
            (t) => (t.originalPriceMonthly - t.priceMonthly) / t.originalPriceMonthly
          )
        );
        return discB - discA;
      });
    }

    return result;
  }, [selectedCategory, searchQuery, selectedSort]);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Link filter katalog disalin ke clipboard! Siap dibagikan.");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("Semua");
    setSelectedSort("featured");
    setSearchQuery("");
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Promo Akhir Tahun Kodeva — Kuota Terbatas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Katalog Software & Add-On Bisnis Kodeva
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Pilih modul software yang Anda butuhkan untuk cabang usaha. Setiap paket dilengkapi
              garansi setup, panduan implementasi, dan penyimpanan data cloud terenkripsi.
            </p>
          </div>
        </div>

        {/* Search, Filter & Sort Controls Toolbar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari software (misal: kasir, payroll, stok, qr menu)..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base sm:text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown & Share Link */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Urutkan:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-transparent text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="featured">Rekomendasi</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                  <option value="discount">Diskon Terbesar</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer shrink-0"
                title="Salin Link Filter URL"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Bagikan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    trackCtaClick(`filter_katalog_${cat}`, "marketplace_catalog_filter");
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-900">{filteredProducts.length}</strong> produk software
            </div>
          </div>
        </div>

        {/* Catalog Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const defaultTier = product.tiers.find((t) => t.isPopular) || product.tiers[0];
            const currentQuota = getEffectivePoolQuota(
              product.sharedQuotaPoolId,
              product.remainingPromoQuota
            );
            const discountPercent = Math.round(
              ((defaultTier.originalPriceMonthly - defaultTier.priceMonthly) /
                defaultTier.originalPriceMonthly) *
                100
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={product.screenshots[0]?.url || ""}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {product.category}
                    </span>
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Diskon {discountPercent}%
                    </span>
                  </div>

                  {/* Quota Status Bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 flex items-center justify-between text-[11px] text-white">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Sisa Kuota Promo:
                    </span>
                    <span className="font-bold font-mono text-amber-300">
                      {currentQuota > 0 ? `${currentQuota} Lisensi` : "Promo Habis"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      <Link href={`/marketplace/${product.slug}`}>{product.name}</Link>
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Tier Pills Preview */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {product.tiers.map((t) => (
                        <span
                          key={t.id}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                            t.isPopular
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>

                    {/* Features Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {defaultTier.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-400 line-through">
                        {formatIDR(defaultTier.originalPriceMonthly)}
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {formatIDR(defaultTier.priceMonthly)}
                        <span className="text-[11px] font-normal text-slate-500 font-sans">
                          /bln
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${product.slug}`}
                      onClick={() =>
                        trackCtaClick(`katalog_detail_${product.slug}`, "marketplace_catalog_card")
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Lihat Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tidak ada software yang cocok</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kata kunci &ldquo;{searchQuery}&rdquo; atau filter &ldquo;{selectedCategory}&rdquo; tidak menemukan hasil.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketplaceCatalogPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 font-medium">Memuat katalog software...</div>}>
      <MarketplaceCatalogContent />
    </Suspense>
  );
}
