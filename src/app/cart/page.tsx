"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { useUtmStore } from "@/lib/store/utmStore";
import { formatIDR } from "@/lib/utils";
import { trackBeginCheckout, trackCtaClick } from "@/lib/analytics/dataLayer";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Flame,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { VoucherInput } from "@/components/cart/VoucherInput";

export function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cartStore = useCartStore();
  const utmStore = useUtmStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    const timer = setTimeout(() => setMounted(true), 15);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="py-24 text-center text-slate-500 font-medium">
        Memuat keranjang belanja...
      </div>
    );
  }

  const items = cartStore.items;
  const subtotal = cartStore.getSubtotal();
  const originalSubtotal = cartStore.getOriginalSubtotal();
  const totalSavings = cartStore.getTotalSavings();
  const totalLicenses = cartStore.getTotalLicenseCount();

  const handleUpdateQty = (productId: string, tierId: string, delta: number) => {
    setErrorMessage(null);
    const result = cartStore.updateItemQuantity(productId, tierId, delta);
    if (!result.success) {
      setErrorMessage(result.error || "Gagal mengubah jumlah lisensi.");
      toast.error(result.error || "Gagal mengubah jumlah lisensi.");
    } else {
      toast.info("Jumlah lisensi di keranjang diperbarui.");
    }
  };

  const handleRemoveItem = (productId: string, tierId: string, name: string) => {
    cartStore.removeItem(productId, tierId);
    toast.info(`${name} dihapus dari keranjang.`);
  };

  const handleBeginCheckout = () => {
    trackCtaClick("proceed_to_checkout", "cart_page");
    trackBeginCheckout(items, subtotal, utmStore.getUtmPayload());
  };

  // Group items by pool to show shared quota breakdown
  const poolSummaries = items.reduce((acc, item) => {
    const existing = acc[item.sharedQuotaPoolId] || {
      productName: item.productName,
      claimed: 0,
      maxAllowed: cartStore.getEffectivePoolQuota(
        item.sharedQuotaPoolId,
        item.maxSharedQuota
      ),
    };
    existing.claimed += item.quantity;
    acc[item.sharedQuotaPoolId] = existing;
    return acc;
  }, {} as Record<string, { productName: string; claimed: number; maxAllowed: number }>);

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb: hidden on desktop */}
        <div className="mb-6 md:hidden">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali Berbelanja Software</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
              Keranjang Lisensi Software
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Periksa rincian lisensi software yang ingin Anda aktifkan untuk cabang usaha.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => cartStore.clearCart()}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Kosongkan Keranjang
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="font-semibold">{errorMessage}</div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto space-y-5 my-8">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Keranjang Belanja Masih Kosong</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Anda belum memilih lisensi software. Silakan jelajahi katalog aplikasi kasir,
                HR & payroll, atau add-on bisnis kami dengan harga promo akhir tahun.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <span>Jelajahi Katalog Promo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.tierId}`}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition"
                  >
                    {/* Item Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Paket {item.tierName}
                        </span>
                        {item.billingCycle === "yearly" && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Tahunan (Hemat 20%)
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        <Link
                          href={`/marketplace/${item.productSlug}`}
                          className="hover:text-indigo-600 transition"
                        >
                          {item.productName}
                        </Link>
                      </h4>
                      <div className="text-xs text-slate-500 font-mono">
                        {formatIDR(item.price)} / lisensi / {item.billingCycle === "yearly" ? "tahun" : "bulan"}
                        <span className="text-slate-400 line-through ml-2">
                          {formatIDR(item.originalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, item.tierId, -1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 text-sm font-bold transition"
                          title="Kurangi Lisensi"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-900 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, item.tierId, 1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 text-sm font-bold transition"
                          title="Tambah Lisensi"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[120px]">
                        <div className="text-sm font-black text-slate-900 font-mono">
                          {formatIDR(item.price * item.quantity)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Hemat {formatIDR((item.originalPrice - item.price) * item.quantity)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId, item.tierId, item.productName)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                        title="Hapus Dari Keranjang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shared Quota Summary Card (Requirement Visual Verification) */}
              <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <span>Validasi Kuota Promo Bersama Lintas Paket (Shared Invariant Pool):</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(poolSummaries).map(([poolId, pool]) => (
                    <div
                      key={poolId}
                      className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800">{pool.productName}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              pool.claimed >= pool.maxAllowed ? "bg-rose-600" : "bg-indigo-600"
                            }`}
                            style={{
                              width: `${Math.min(100, (pool.claimed / pool.maxAllowed) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-[11px]">
                          {pool.claimed} / {pool.maxAllowed} Kuota Terisi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed italic">
                  *Sistem membatasi agar kombinasi seluruh tier (Starter, Pro, Business) dari produk
                  yang sama tidak dapat melampaui sisa kuota promo global.
                </p>
              </div>
            </div>

            {/* Right Order Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Ringkasan Pesanan
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Unit Lisensi:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {totalLicenses} Lisensi
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Harga Normal (Tanpa Promo):</span>
                    <span className="font-mono line-through text-slate-400">
                      {formatIDR(originalSubtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Diskon Promo Akhir Tahun:
                    </span>
                    <span className="font-mono">- {formatIDR(cartStore.getOriginalSubtotal() - cartStore.getSubtotal())}</span>
                  </div>

                  {cartStore.getVoucherDiscount() > 0 && (
                    <div className="flex justify-between text-indigo-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Diskon Kupon ({cartStore.appliedVoucher?.code}):
                      </span>
                      <span className="font-mono">- {formatIDR(cartStore.getVoucherDiscount())}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between text-base">
                    <span className="font-extrabold text-slate-900">Total Tagihan:</span>
                    <span className="text-2xl font-black text-indigo-600 font-mono">
                      {formatIDR(cartStore.getFinalTotal())}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    *Termasuk PPN 11% & Biaya Pemeliharaan Cloud
                  </div>
                </div>

                <VoucherInput />

                <Link
                  href="/checkout"
                  onClick={handleBeginCheckout}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-99"
                >
                  <span>Lanjutkan ke Checkout ({formatIDR(cartStore.getFinalTotal())})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Garansi 100% uang kembali jika modul tidak sesuai kebutuhan</span>
                  </div>
                  <div className="text-slate-400">
                    Data transaksi terlindungi dengan enkripsi AES-256 tingkat enterprise.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
