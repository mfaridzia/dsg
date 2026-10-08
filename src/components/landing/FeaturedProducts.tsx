"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/marketplace";
import { formatIDR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import { ArrowRight, Flame, Sparkles, Check } from "lucide-react";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const getEffectivePoolQuota = useCartStore((state) => state.getEffectivePoolQuota);

  return (
    <section className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Katalog Unggulan — Kuota Promo Terbatas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Software Esensial untuk Percepat Skala Usaha Anda
          </h2>
          <p className="text-base text-slate-600">
            Pilih software yang paling sesuai dengan kebutuhan cabang Anda saat ini.
            Dapatkan harga promo akhir tahun dengan lisensi berlangganan fleksibel.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => {
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
                className="bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:border-indigo-200 transition-all group"
              >
                {/* Product Image */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={product.screenshots[0]?.url || ""}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                      {product.category}
                    </span>
                    <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Hemat {discountPercent}%
                    </span>
                  </div>

                  {/* Sisa Kuota Bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs text-white">
                    <span className="text-slate-300">Sisa Kuota Promo:</span>
                    <span className="font-bold font-mono text-amber-400">
                      {currentQuota > 0 ? `${currentQuota} Lisensi Tersedia` : "Habis"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Features Preview */}
                    <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4">
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Fitur Paket Rekomendasi ({defaultTier.name}):
                      </div>
                      {defaultTier.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-400 line-through">
                        {formatIDR(defaultTier.originalPriceMonthly)}/bln
                      </div>
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {formatIDR(defaultTier.priceMonthly)}
                        <span className="text-xs font-normal text-slate-500 font-sans">/bln</span>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${product.slug}`}
                      onClick={() =>
                        trackCtaClick(`featured_detail_${product.slug}`, "featured_products_section")
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm hover:shadow"
                    >
                      <span>Pilih Paket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/marketplace"
            onClick={() => trackCtaClick("view_all_marketplace", "featured_products_footer")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow"
          >
            <span>Buka Katalog Lengkap Mini Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
