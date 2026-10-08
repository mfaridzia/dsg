"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/lib/data/products";
import { formatIDR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import {
  Store,
  Filter,
  Flame,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Users,
} from "lucide-react";

export default function MarketplaceCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const getEffectivePoolQuota = useCartStore((state) => state.getEffectivePoolQuota);

  const categories = [
    "Semua",
    "Kasir & POS",
    "SDM & Payroll",
    "Operasional & Stok",
    "Add-On",
  ];

  const filteredProducts =
    selectedCategory === "Semua"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    trackCtaClick(`filter_katalog_${cat}`, "marketplace_catalog_filter");
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-12 relative overflow-hidden">
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

        {/* Filter Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
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
      </div>
    </div>
  );
}
