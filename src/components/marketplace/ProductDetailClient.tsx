"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductTier } from "@/types/marketplace";
import { formatIDR } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useUtmStore } from "@/lib/store/utmStore";
import { trackViewItem, trackAddToCart, trackCtaClick } from "@/lib/analytics/dataLayer";
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
  Info,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const defaultTier = product.tiers.find((t) => t.isPopular) || product.tiers[0];
  const [selectedTier, setSelectedTier] = useState<ProductTier>(defaultTier);
  const [selectedScreenshotIdx, setSelectedScreenshotIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const cartStore = useCartStore();
  const utmStore = useUtmStore();
  const hasTrackedViewItemRef = useRef(false);

  // Track view_item ONCE per mount (Deduplication guard)
  useEffect(() => {
    if (product && !hasTrackedViewItemRef.current) {
      hasTrackedViewItemRef.current = true;
      trackViewItem(product, selectedTier, utmStore.getUtmPayload());
    }
  }, [product, selectedTier, utmStore]);

  const activeTier = selectedTier;
  const effectiveQuota = cartStore.getEffectivePoolQuota(
    product.sharedQuotaPoolId,
    product.remainingPromoQuota
  );
  const alreadyInCartForPool = cartStore.getTotalPoolQuantity(product.sharedQuotaPoolId);
  const availableRemainingQuota = Math.max(0, effectiveQuota - alreadyInCartForPool);

  // Price calculations based on billing cycle
  const currentPrice =
    billingCycle === "yearly"
      ? Math.round(activeTier.priceMonthly * 12 * 0.8)
      : activeTier.priceMonthly;

  const currentOriginalPrice =
    billingCycle === "yearly"
      ? activeTier.originalPriceMonthly * 12
      : activeTier.originalPriceMonthly;

  const savingsAmount = currentOriginalPrice - currentPrice;

  const handleSelectTier = (tier: ProductTier) => {
    setSelectedTier(tier);
    setFeedbackMsg(null);
    trackCtaClick(`select_tier_${tier.id}_${product.slug}`, "tier_selector");
  };

  const handleAddToCart = () => {
    setFeedbackMsg(null);

    const result = cartStore.addItem(product, activeTier, quantity, billingCycle);

    if (result.success) {
      trackAddToCart(product, activeTier, quantity, utmStore.getUtmPayload());
      toast.success(
        `${quantity} lisensi ${product.name} (${activeTier.name} - ${
          billingCycle === "yearly" ? "Tahunan" : "Bulanan"
        }) ditambahkan ke keranjang!`
      );
      setFeedbackMsg({
        type: "success",
        text: `Berhasil menambahkan ${quantity} lisensi ${product.name} (${activeTier.name} - ${
          billingCycle === "yearly" ? "Tahunan" : "Bulanan"
        }) ke keranjang!`,
      });
    } else {
      toast.error(result.error || "Gagal menambahkan item ke keranjang.");
      setFeedbackMsg({
        type: "error",
        text: result.error || "Gagal menambahkan item ke keranjang.",
      });
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog Produk</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visual Gallery & Product Story */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Screenshot Container */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md">
              <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                <Image
                  src={product.screenshots[selectedScreenshotIdx]?.url || ""}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                  {product.category}
                </div>
              </div>

              {/* Caption */}
              <p className="text-xs text-slate-500 italic mt-3 text-center">
                &ldquo;{product.screenshots[selectedScreenshotIdx]?.caption}&rdquo;
              </p>

              {/* Thumbnail Selector */}
              {product.screenshots.length > 1 && (
                <div className="flex gap-3 mt-4 justify-center">
                  {product.screenshots.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedScreenshotIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                        selectedScreenshotIdx === idx
                          ? "border-indigo-600 shadow-md scale-105"
                          : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={s.url} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Tentang {product.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Keamanan Cloud Terjamin</h4>
                    <p className="text-[11px] text-slate-500">
                      Enkripsi SSL 256-bit & backup otomatis harian di server cloud Indonesia.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Aktivasi Instan</h4>
                    <p className="text-[11px] text-slate-500">
                      Lisensi langsung diterbitkan via email begitu pembayaran terkonfirmasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Configuration & Purchase Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 sticky top-24">
              {/* Product Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Lisensi Resmi
                  </span>
                  <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Promo Akhir Tahun
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">{product.tagline}</p>
              </div>

              {/* DURATION SWITCH: Bulanan vs Tahunan */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilihan Durasi Langganan:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      billingCycle === "monthly"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Tagihan Bulanan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      billingCycle === "yearly"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Tahunan</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400 line-through">
                    {formatIDR(currentOriginalPrice)} /{billingCycle === "yearly" ? "tahun" : "bulan"}
                  </div>
                  <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {formatIDR(currentPrice)}
                    <span className="text-xs font-normal text-slate-500 font-sans ml-1">
                      /{billingCycle === "yearly" ? "lisensi/tahun" : "lisensi/bln"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-1 rounded-md">
                    Hemat {formatIDR(savingsAmount)}
                  </span>
                </div>
              </div>

              {/* Promo Quota Shared Pool Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
                    Sisa Kuota Promo Lisensi:
                  </span>
                  <span className="font-mono text-sm">
                    {availableRemainingQuota > 0
                      ? `${availableRemainingQuota} Tersedia`
                      : "Habis Terjual"}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  *Batas kuota promo berlaku bersama untuk semua pilihan paket (Starter/Pro/Business)
                  pada produk ini.
                  {alreadyInCartForPool > 0 && (
                    <span className="font-semibold block text-indigo-700 mt-0.5">
                      (Anda sudah memasukkan {alreadyInCartForPool} lisensi produk ini di keranjang)
                    </span>
                  )}
                </p>
              </div>

              {/* Tier Selection (Basic / Pro / Business) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Paket Lisensi:
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {product.tiers.map((tier) => {
                    const isSelected = activeTier.id === tier.id;
                    const tierPrice =
                      billingCycle === "yearly"
                        ? Math.round(tier.priceMonthly * 12 * 0.8)
                        : tier.priceMonthly;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => handleSelectTier(tier)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                            {tier.isPopular && (
                              <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Pilihan Terpopuler
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {formatIDR(tierPrice)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 pl-6">
                          {tier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Jumlah Lisensi (Cabang / Outlet):
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={availableRemainingQuota <= quantity}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Feedback Alert */}
                {feedbackMsg && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-scale-in ${
                      feedbackMsg.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {feedbackMsg.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={availableRemainingQuota <= 0}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-99 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {availableRemainingQuota > 0
                      ? `Tambah ke Keranjang — ${formatIDR(currentPrice * quantity)}`
                      : "Batas Kuota Promo Telah Tercapai"}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>Isi keranjang otomatis tersimpan walau halaman di-refresh</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FEATURE COMPARISON MATRIX TABLE (BONUS REQUIREMENT)            */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Matriks Komparasi Lengkap
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Perbandingan Fitur Antar Paket {product.name}
            </h2>
            <p className="text-xs text-slate-500">
              Pilih spesifikasi yang paling sesuai dengan skala dan kebutuhan operasional bisnis Anda.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-4 px-4 font-bold text-slate-800 text-sm w-1/4">Spesifikasi & Kapasitas</th>
                  {product.tiers.map((t) => (
                    <th
                      key={t.id}
                      className={`py-4 px-4 text-center w-1/4 ${
                        activeTier.id === t.id ? "bg-indigo-50/60 font-bold" : ""
                      }`}
                    >
                      <div className="text-sm font-black text-slate-900">{t.name}</div>
                      <div className="font-mono font-bold text-indigo-600 mt-0.5">
                        {formatIDR(
                          billingCycle === "yearly"
                            ? Math.round(t.priceMonthly * 12 * 0.8)
                            : t.priceMonthly
                        )}
                        <span className="text-[10px] text-slate-500 font-sans">
                          /{billingCycle === "yearly" ? "thn" : "bln"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Kapasitas Outlet / Cabang</td>
                  <td className="py-3 px-4 text-center">1 Outlet Utama</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30 font-semibold text-indigo-900">Hingga 5 Cabang</td>
                  <td className="py-3 px-4 text-center font-semibold text-indigo-900">Multi-Cabang Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Jumlah Akun Staf / Kasir</td>
                  <td className="py-3 px-4 text-center">3 Akun Kasir</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30">10 Akun Staf & Supervisor</td>
                  <td className="py-3 px-4 text-center">Unlimited Akun & Role-Based Access</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Manajemen Stok & COGS HPP</td>
                  <td className="py-3 px-4 text-center">Stok Sederhana</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30 font-semibold text-emerald-700">Multi-Gudang & Resep Otomatis</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-700">Supply Chain & Transfer Antar-Gudang</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Laporan Penjualan & Pajak</td>
                  <td className="py-3 px-4 text-center">Harian & Bulanan</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30">Lengkap + Export Excel / PDF</td>
                  <td className="py-3 px-4 text-center">Otomatisasi Laporan Pajak & Akuntansi</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Dukungan Hardware Printer & Barcode</td>
                  <td className="py-3 px-4 text-center">Printer Bluetooth Thermal</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30">Thermal, LAN & Barcode Scanner</td>
                  <td className="py-3 px-4 text-center">Seluruh Hardware POS Enterprise</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Akses REST API & Webhook</td>
                  <td className="py-3 px-4 text-center text-slate-300">-</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30 text-slate-300">-</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600">✓ Termasuk Full API Webhook</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Prioritas Dukungan Teknis CS</td>
                  <td className="py-3 px-4 text-center">Jam Kerja (Email)</td>
                  <td className="py-3 px-4 text-center bg-indigo-50/30">WhatsApp Dedicated Support</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-700">24/7 Account Manager Dedicated</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-4 px-4 font-bold text-slate-900">Pilih Paket:</td>
                  {product.tiers.map((t) => (
                    <td key={t.id} className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectTier(t)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTier.id === t.id
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-white hover:bg-slate-100 border border-slate-300 text-slate-800"
                        }`}
                      >
                        {activeTier.id === t.id ? "✓ Paket Terpilih" : `Pilih ${t.name}`}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
