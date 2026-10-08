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
  User,
  Loader2,
  ArrowLeft,
  FileText,
  QrCode,
  Clock,
  ExternalLink,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { VoucherInput } from "@/components/cart/VoucherInput";

interface OrderSnapshot {
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    whatsapp: string;
    company: string;
  };
  paymentMethod: "qris" | "va";
  items: {
    productId: string;
    productName: string;
    tierName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Buyer Form State (strictly scoped)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "va">("qris");

  // Step 2: Pending Payment Gateway State (Menunggu Pembayaran)
  const [pendingOrder, setPendingOrder] = useState<OrderSnapshot | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(899); // 14:59 minutes

  // Step 3: Finished Order Result State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    status: "success" | "failed";
    invoiceNumber: string;
    customer: {
      name: string;
      email: string;
      whatsapp: string;
      company: string;
    };
    paymentMethod: string;
    licenseKeys?: { product: string; tier: string; key: string }[];
    errorReason?: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedVa, setCopiedVa] = useState(false);

  const cartStore = useCartStore();
  const utmStore = useUtmStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useUtmStore.persist.rehydrate();
    const timer = setTimeout(() => setMounted(true), 15);
    return () => clearTimeout(timer);
  }, []);

  const items = cartStore.items;
  const subtotal = cartStore.getSubtotal();
  const finalTotal = cartStore.getFinalTotal();
  const voucherDiscount = cartStore.getVoucherDiscount();
  const utmParams = utmStore.getUtmPayload();

  // Reset any lingering order result when entering with active cart items or unmounting
  useEffect(() => {
    if (items.length > 0) {
      setOrderResult(null);
      setPendingOrder(null);
    }
    return () => {
      setOrderResult(null);
      setPendingOrder(null);
    };
  }, [items.length]);

  // Countdown timer for pending payment step
  useEffect(() => {
    if (!pendingOrder) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingOrder]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleResetAndNavigate = (targetPath: string) => {
    setOrderResult(null);
    setPendingOrder(null);
    setName("");
    setEmail("");
    setWhatsapp("");
    setCompany("");
    router.push(targetPath);
  };

  if (!mounted) {
    return <div className="py-24 text-center text-slate-500">Memuat halaman checkout...</div>;
  }

  // Redirect if cart is empty and not currently viewing pending payment or finished order
  if (items.length === 0 && !orderResult && !pendingOrder) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-md w-full text-center space-y-5 animate-scale-in">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Keranjang Belanja Kosong
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Anda belum memilih lisensi software. Silakan jelajahi katalog aplikasi kasir, HR, atau add-on bisnis kami.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-99"
            >
              <span>Jelajahi Katalog Software</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: Form Submission -> Buka Instruksi Pembayaran (QRIS / VA)
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const invoiceNumber = `INV-KDV-${Date.now().toString().slice(-6)}`;
    const snapshot: OrderSnapshot = {
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
      totalAmount: finalTotal,
    };

    setPendingOrder(snapshot);
    setCountdownSeconds(899);
    toast.info("Tagihan dibuat. Silakan lakukan pembayaran sesuai petunjuk.");
  };

  // STEP 2A: Simulasi Pembayaran Berhasil (User sudah scan QR / transfer)
  const handleConfirmSuccessPayment = async () => {
    if (!pendingOrder) return;
    setIsProcessing(true);

    // Simulate network delay to payment gateway
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Generate license keys
    const licenseKeys = pendingOrder.items.map((item) => ({
      product: item.productName,
      tier: item.tierName,
      key: `KDV-${item.productId.slice(-3).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    }));

    // Dispatch GA4 Purchase event to dataLayer
    pushToDataLayer({
      event: "purchase",
      ecommerce: {
        currency: "IDR",
        value: pendingOrder.totalAmount,
        items: pendingOrder.items.map((i) => ({
          item_id: i.productId,
          item_name: `${i.productName} (${i.tierName})`,
          price: i.price,
          quantity: i.quantity,
        })),
      },
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
    });

    // Clear cart in store & decrement quota
    cartStore.simulateOrderSuccess();

    // Set order result from snapshot
    setOrderResult({
      status: "success",
      invoiceNumber: pendingOrder.invoiceNumber,
      customer: pendingOrder.customer,
      paymentMethod: pendingOrder.paymentMethod,
      licenseKeys,
    });

    setPendingOrder(null);
    setIsProcessing(false);
    toast.success("Pembayaran berhasil dikonfirmasi! Kunci lisensi software Anda telah aktif.");
  };

  // STEP 2B: Simulasi Pembayaran Gagal / Ditolak Bank
  const handleFailPayment = async () => {
    if (!pendingOrder) return;
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setOrderResult({
      status: "failed",
      invoiceNumber: pendingOrder.invoiceNumber,
      customer: pendingOrder.customer,
      paymentMethod: pendingOrder.paymentMethod,
      errorReason:
        "Otorisasi bank ditolak: Saldo rekening tidak mencukupi atau batas harian transaksi kartu terlampaui. Silakan gunakan metode pembayaran lain.",
    });

    setPendingOrder(null);
    setIsProcessing(false);
    toast.error("Pembayaran gagal diproses.");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("Kunci lisensi berhasil disalin!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyVa = (vaText: string) => {
    navigator.clipboard.writeText(vaText);
    setCopiedVa(true);
    toast.success("Nomor Virtual Account berhasil disalin!");
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb: hidden on desktop */}
        {!pendingOrder && !orderResult && (
          <div className="mb-6 md:hidden">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Keranjang</span>
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PAYMENT INSTRUCTION VIEW (QRIS / VA WAITING SCREEN)     */}
        {/* ============================================================== */}
        {pendingOrder && !orderResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-2xl mx-auto space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Menunggu Pembayaran
                </span>
                <h1 className="text-xl font-black text-slate-900 mt-1">
                  {pendingOrder.paymentMethod === "qris" ? "Pembayaran QRIS Standar" : "Transfer Virtual Account"}
                </h1>
                <p className="text-xs text-slate-500">
                  Invoice: <strong className="font-mono text-slate-700">{pendingOrder.invoiceNumber}</strong>
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Batas Waktu Bayar</span>
                </div>
                <div className="font-mono font-bold text-amber-600 text-sm">
                  {formatCountdown(countdownSeconds)}
                </div>
              </div>
            </div>

            {/* Total Tagihan Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">Total Nominal Pembayaran:</div>
                <div className="text-2xl font-black text-indigo-600 font-mono">
                  {formatIDR(pendingOrder.totalAmount)}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Atas Nama: <strong className="text-slate-800">{pendingOrder.customer.name}</strong></div>
                <div>Metode: <strong className="uppercase text-slate-800">{pendingOrder.paymentMethod}</strong></div>
              </div>
            </div>

            {/* Content per Method */}
            {pendingOrder.paymentMethod === "qris" ? (
              <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                  {/* QRIS Graphic Mockup */}
                  <div className="w-48 h-48 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-between mx-auto relative overflow-hidden">
                    <div className="w-full flex justify-between items-center text-[9px] text-white font-bold px-1">
                      <span>QRIS</span>
                      <span className="text-[8px] opacity-75">NMID: ID10203040</span>
                    </div>
                    {/* QR Matrix visual */}
                    <div className="w-36 h-36 bg-white rounded-lg p-2 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <div className="text-[9px] text-white/80 font-mono tracking-widest">
                      PT DIGITAL SOLUSI GRUP
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Scan Kode QR di atas melalui aplikasi e-Wallet atau M-Banking:
                  </p>
                  <p className="text-[11px] text-slate-500">
                    BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, DANA, LinkAja
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Bank Tujuan:</div>
                  <div className="text-sm font-bold text-slate-900">BCA (Bank Central Asia)</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">Nomor Virtual Account:</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xl font-black text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 tracking-wider">
                      8808 7234 9182 0192
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyVa("8808723491820192")}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVa ? "Tersalin" : "Salin VA"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-100 text-[11px] text-slate-600 space-y-1">
                  <p>1. Buka m-BCA &gt; m-Transfer &gt; BCA Virtual Account</p>
                  <p>2. Masukkan nomor VA di atas dan pastikan nominal sesuai: <strong>{formatIDR(pendingOrder.totalAmount)}</strong></p>
                </div>
              </div>
            )}

            {/* Interactive Simulation Controls */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Simulasi Transaksi (Pilih Respons untuk Uji Coba):</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmSuccessPayment}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Saya Sudah Bayar (Konfirmasi Lunas)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleFailPayment}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
                >
                  ✕ Simulasikan Gagal
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPendingOrder(null)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Ubah Data Pemesan atau Metode Pembayaran
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: FINISHED ORDER STATE (SUCCESS / FAILED RECEIPT)         */}
        {/* ============================================================== */}
        {orderResult && (
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
                    Terima kasih, <strong>{orderResult.customer.name}</strong>. Lisensi software bisnis Kodeva Anda telah
                    aktif. Detail faktur pajak dan petunjuk setup telah dikirimkan ke{" "}
                    <strong>{orderResult.customer.email}</strong>.
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
                      {orderResult.paymentMethod === "qris" ? "QRIS Dinamis" : "Virtual Account Bank"}
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
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-800 font-sans text-xs">
                            {lk.product} ({lk.tier})
                          </div>
                          <div className="text-indigo-600 font-bold text-sm tracking-widest mt-0.5">
                            {lk.key}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyKey(lk.key)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-sans font-semibold text-xs flex items-center gap-1 transition"
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
                  <button
                    type="button"
                    onClick={() => handleResetAndNavigate("/marketplace")}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow transition cursor-pointer"
                  >
                    Beli Lisensi Software Lain
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetAndNavigate("/")}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition cursor-pointer"
                  >
                    Kembali ke Beranda
                  </button>
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
                  <button
                    type="button"
                    onClick={() => handleResetAndNavigate("/cart")}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition"
                  >
                    Kembali ke Keranjang
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: INITIAL CHECKOUT FORM (DATA PEMBELI & RINGKASAN ITEM)  */}
        {/* ============================================================== */}
        {!pendingOrder && !orderResult && (
          <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base sm:text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base sm:text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base sm:text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base sm:text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Pilih Metode Pembayaran</h2>
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
                      Scan via BCA Mobile, GoPay, OVO, ShopeePay, atau DANA.
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
                        BCA / Mandiri
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nomor VA unik otomatis terverifikasi 24 jam realtime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary: Items & Submit to Gateway Button */}
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
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-indigo-600 font-semibold">
                      <span>Diskon Kupon ({cartStore.appliedVoucher?.code}):</span>
                      <span className="font-mono">- {formatIDR(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan & PPN:</span>
                    <span className="font-mono font-medium text-emerald-600">Termasuk</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-100">
                    <span>Total Tagihan:</span>
                    <span className="font-mono text-xl text-indigo-600">
                      {formatIDR(finalTotal)}
                    </span>
                  </div>
                </div>

                <VoucherInput />

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-99 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Lanjut ke Pembayaran ({formatIDR(finalTotal)})</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Dengan melanjutkan, Anda menyetujui Ketentuan Lisensi Software Bisnis Kodeva.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
