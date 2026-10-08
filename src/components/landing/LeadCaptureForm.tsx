"use client";

import { useState, useEffect } from "react";
import { useUtmStore } from "@/lib/store/utmStore";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import { ShieldCheck, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LeadCaptureForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [interest, setInterest] = useState("Kodeva POS Kasir Multi-Outlet");
  
  // Anti-spam states
  const [honeypot, setHoneypot] = useState(""); // Bot trap
  const [renderedAt, setRenderedAt] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const utmStore = useUtmStore();

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Track click
    trackCtaClick("submit_lead_form", "landing_lead_capture");

    const utmPayload = utmStore.getUtmPayload();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          company,
          interest,
          website: honeypot, // Honeypot field
          renderedAt,
          utmSource: utmPayload.utm_source,
          utmMedium: utmPayload.utm_medium,
          utmCampaign: utmPayload.utm_campaign,
          utmContent: utmPayload.utm_content,
          utmTerm: utmPayload.utm_term,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses pendaftaran. Silakan periksa data Anda.");
      }

      setSubmitted(true);
      toast.success("Konsultasi berhasil diajukan! Tim spesialis Kodeva akan segera menghubungi Anda.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="lead-form" className="py-20 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900/90 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Form Header */}
          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Konsultasi Gratis & Promo Khusus</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ingin Diskusi Kebutuhan Software Cabang Anda?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Isi data di bawah ini. Tim spesialis solusi bisnis kami akan mendemokan alur kasir & payroll langsung untuk bisnis Anda.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-950/60 border border-emerald-600/50 rounded-2xl p-8 text-center space-y-4 animate-scale-in">
              <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-bold shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Permintaan Demo Berhasil Terkirim!
              </h3>
              <p className="text-sm text-emerald-200 max-w-md mx-auto leading-relaxed">
                Halo <strong>{name}</strong>, data Anda telah tercatat di sistem kami.
                Konsultan bisnis Kodeva akan menghubungi Anda melalui WhatsApp di nomor <strong>{whatsapp}</strong> dalam waktu maksimal 15 menit pada jam kerja.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setWhatsapp("");
                  setCompany("");
                }}
                className="mt-4 px-4 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-xs font-semibold rounded-lg text-white transition"
              >
                Kirim Pertanyaan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Anti-spam Honeypot (Hidden from Humans) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website (Leave empty)</label>
                <input
                  id="website"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Hendra Wijaya"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Email Perusahaan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Email Kantor / Bisnis <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@bisnisanda.com"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Nama Usaha */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Nama Usaha / Brand (Opsional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Contoh: Kopi Nusantara (2 Outlet)"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Produk yang Diminati */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Modul yang Ingin Diberikan Demo
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="Kodeva POS Kasir Multi-Outlet">Kodeva POS Kasir Multi-Outlet</option>
                  <option value="Kodeva HR & Payroll Otomatis (PPh 21)">Kodeva HR & Payroll Otomatis (PPh 21)</option>
                  <option value="Kodeva Smart Inventory & Multi-Gudang">Kodeva Smart Inventory & Multi-Gudang</option>
                  <option value="Kodeva Akuntansi & Keuangan">Kodeva Akuntansi & Laporan Pajak</option>
                  <option value="Paket Komplit Promo Akhir Tahun">Paket Bundling Promo Akhir Tahun (Diskon 45%)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-99"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Mengirim Data...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dapatkan Konsultasi & Kunci Promo Sekarang</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2.5">
                  Privasi terjamin. Data Anda tidak akan dibagikan ke pihak ketiga atau digunakan untuk spam.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
