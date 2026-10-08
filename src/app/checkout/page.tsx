"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useUtmStore } from "@/lib/store/utmStore";
import { formatIDR } from "@/lib/utils";
import { pushToDataLayer } from "@/lib/analytics/dataLayer";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Building,
  Mail,
  User,
  Phone,
  Loader2,
  ArrowLeft,
  FileText,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Buyer Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  
  // Simulation Mode Selection (Sukses vs Gagal)
  const [simulationMode, setSimulationMode] = useState<"success" | "fail">("success");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    status: "success" | "failed";
    invoiceNumber?: string;
    licenseKeys?: { product: string; tier: string; key: string }[];
    errorReason?: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cartStore = useCartStore();
  const utmStore = useUtmStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useUtmStore.persist.rehydrate();
    const timer = setTimeout(() => setMounted(true), 15);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="py-24 text-center text-slate-500">Memuat halaman checkout...</div>;
  }

  const items = cartStore.items;
  const subtotal = cartStore.getSubtotal();
  const utmParams = utmStore.getUtmPayload();

  // Redirect if cart is empty and not viewing a finished order result
  if (items.length === 0 && !orderResult) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Keranjang Belanja Anda Kosong</h2>
        <p className="text-xs text-slate-500">Silakan pilih produk terlebih dahulu sebelum checkout.</p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
        >
          <span>Kembali ke Katalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setOrderResult(null);

    // Simulate Payment Gateway Network Latency (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const invoiceNumber = `INV-KDV-${Date.now().toString().slice(-6)}`;

    // Prepare mock order payload with UTM attribution
    const orderPayload = {
      invoiceNumber,
      customer: { name, email, whatsapp, company },
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        tierName: item.tierName,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: subtotal,
      utmAttribution: utmParams,
      createdAt: new Date().toISOString(),
    };

    console.log("[Mock Payment Gateway Payload with UTM]:", orderPayload);

    if (simulationMode === "success") {
      // Generate realistic license activation keys
      const licenseKeys = items.map((item) => ({
        product: item.productName,
        tier: item.tierName,
        key: `KDV-${item.productId.slice(-3).toUpperCase()}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      }));

      // Push GA4 Purchase event to dataLayer
      pushToDataLayer({
        event: "purchase",
        ecommerce: {
          currency: "IDR",
          value: subtotal,
          items: items.map((i) => ({
            item_id: `${i.productId}-${i.tierId}`,
            item_name: `${i.productName} (${i.tierName})`,
            price: i.price,
            quantity: i.quantity,
          })),
        },
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
      });

      // Decrement shared quota & clear cart in state
      cartStore.simulateOrderSuccess();

      setOrderResult({
        status: "success",
        invoiceNumber,
        licenseKeys,
      });
    } else {
      setOrderResult({
        status: "failed",
        invoiceNumber,
        errorReason:
          "Otorisasi bank ditolak: Saldo rekening tidak mencukupi atau batas harian transaksi kartu terlampaui. Silakan gunakan metode pembayaran lain.",
      });
    }

    setIsProcessing(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Keranjang</span>
          </Link>
        </div>

        {/* Finished Order State (Success / Failed) */}
        {orderResult ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-2xl mx-auto space-y-8 animate-scale-in">
            {orderResult.status === "success" ? (
              <>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Pembayaran Berhasil Dikonfirmasi!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    Terima kasih, <strong>{name}</strong>. Lisensi software bisnis Kodeva Anda telah
                    aktif. Detail faktur pajak dan petunjuk setup telah dikirimkan ke{" "}
                    <strong>{email}</strong>.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-200/80 pb-3 font-sans">
                    <span className="text-slate-500">Nomor Invoice:</span>
                    <strong className="text-slate-900 font-mono">
                      {orderResult.invoiceNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-3 font-sans">
                    <span className="text-slate-500">Status Transaksi:</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                      LUNAS (PAID)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-3 font-sans">
                    <span className="text-slate-500">Metode Pembayaran:</span>
                    <span className="text-slate-800 font-semibold uppercase">
                      {paymentMethod === "qris" ? "QRIS Dinamis" : "Virtual Account Bank"}
                    </span>
                  </div>

                  {/* License Keys List */}
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 font-sans uppercase tracking-wider">
                      Kunci Lisensi Software Anda:
                    </div>
                    {orderResult.licenseKeys?.map((lk, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-[11px] font-sans font-bold text-slate-900">
                            {lk.product} ({lk.tier})
                          </div>
                          <div className="text-xs font-mono text-indigo-700 font-bold">
                            {lk.key}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(lk.key)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 font-sans text-[11px]"
                          title="Salin Kunci Lisensi"
                        >
                          {copiedKey === lk.key ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/marketplace"
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow transition"
                  >
                    Beli Lisensi Software Lain
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Pembayaran Gagal Diproses
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    {orderResult.errorReason}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Kode Transaksi: {orderResult.invoiceNumber}
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Lisensi belum diterbitkan dan kuota promo Anda belum terpotong. Silakan periksa limit pembayaran Anda atau pilih metode pembayaran alternatif.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderResult(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow transition"
                  >
                    Ulangi Pembayaran
                  </button>
                  <Link
                    href="/cart"
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition"
                  >
                    Batal
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Form: Customer Details & Payment Options */}
            <div className="lg:col-span-7 space-y-8">
              {/* Buyer Information Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <User className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Data Pemilik & Usaha</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Hendra Wijaya"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Konfirmasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hendra@kopinusantara.id"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Nama Brand / Outlet (Opsional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Kopi Nusantara"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Metode Pembayaran</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod("qris")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentMethod === "qris"
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                      <span>QRIS Dinamis</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Instan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Scan via GoPay, OVO, ShopeePay, DANA, atau mobile banking apa saja.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("va")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentMethod === "va"
                        ? "border-indigo-600 bg-indigo-50/40"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                      <span>Virtual Account Bank</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                        BCA/Mandiri/BRI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nomor VA unik otomatis terverifikasi 24 jam realtime.
                    </p>
                  </div>
                </div>

                {/* Skenario Uji Reviewer (Interactive Skenario Switcher) */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Skenario Uji Pembayaran (Khusus Reviewer DSG):
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSimulationMode("success")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        simulationMode === "success"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      ✓ Simulasikan Sukses (Paid)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulationMode("fail")}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        simulationMode === "fail"
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white text-slate-700 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      ✕ Simulasikan Gagal (Error)
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800/80">
                    Gunakan tombol di atas untuk menguji respons sistem pada skenario sukses (kuota terpotong & kunci lisensi terbit) vs skenario kegagalan transaksi.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Summary: Items & Pay Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 sticky top-24">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Rincian Item yang Dipesan
                </h3>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.tierId}`}
                      className="py-3 flex justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          Paket {item.tierName} • Qty: {item.quantity} lisensi
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-right">
                        {formatIDR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan & PPN:</span>
                    <span className="font-mono font-medium text-emerald-600">Termasuk</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-100">
                    <span>Total Pembayaran:</span>
                    <span className="font-mono text-xl text-indigo-600">
                      {formatIDR(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-99"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Otorisasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Konfirmasi & Bayar {formatIDR(subtotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Dengan mengklik tombol bayar, Anda menyetujui Ketentuan Lisensi Software Bisnis Kodeva.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
