"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Layout,
  MessageSquareQuote,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Star,
  Save,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { LandingContent, FAQItem, TestimonialItem, PromoSchedule } from "@/types/cms";
import { getPromoScheduleStatus } from "@/lib/utils";
import { toast } from "sonner";

interface LandingContentTabProps {
  initialData: LandingContent;
  onSave: (data: LandingContent) => void;
  isSaving: boolean;
}

export function LandingContentTab({
  initialData,
  onSave,
  isSaving,
}: LandingContentTabProps) {
  const [data, setData] = useState<LandingContent>(initialData);

  const currentSchedule: PromoSchedule = data.promoSchedule || {
    enabled: true,
    startDate: "2025-11-01",
    endDate: "2026-12-31",
    promoBadgeText: data.hero.badge,
    fallbackBadgeText: "✨ Solusi Software Bisnis & Kasir Cloud Terpercaya untuk UMKM",
  };

  const scheduleStatus = getPromoScheduleStatus(currentSchedule, data.hero.badge);

  const handleAddFaq = () => {
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: "",
      answer: "",
    };
    setData((prev) => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
  };

  const handleRemoveFaq = (index: number) => {
    setData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleAddTestimonial = () => {
    const newTesti: TestimonialItem = {
      id: `testi-${Date.now()}`,
      authorName: "",
      role: "Owner / Pengusaha",
      businessName: "",
      businessType: "Retail / F&B",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      quote: "",
      rating: 5,
    };
    setData((prev) => ({
      ...prev,
      testimonials: [...(prev.testimonials || []), newTesti],
    }));
  };

  const handleRemoveTestimonial = (index: number) => {
    setData((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((_, i) => i !== index),
    }));
  };

  const handleAvatarUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Mengunggah foto avatar...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!json.success || !json.url) {
        throw new Error(json.error || "Gagal mengunggah gambar");
      }

      setData((prev) => {
        const next = [...prev.testimonials];
        next[index] = { ...next[index], avatarUrl: json.url };
        return { ...prev, testimonials: next };
      });

      toast.success("Foto avatar berhasil diunggah", { id: toastId });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah foto avatar",
        { id: toastId }
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Editor Konten Landing Page
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Perubahan langsung diperbarui pada halaman beranda dan database Cloudflare D1.
        </p>
      </div>

      {/* Promo Scheduling Section (Bonus Feature) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Penjadwalan Promo Otomatis</h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Fitur Bonus
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tayang dan berakhir otomatis sesuai tanggal tanpa perlu campur tangan developer.
              </p>
            </div>
          </div>

          <div>
            {scheduleStatus.status === "active" && (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{scheduleStatus.label}</span>
              </span>
            )}
            {scheduleStatus.status === "upcoming" && (
              <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{scheduleStatus.label}</span>
              </span>
            )}
            {scheduleStatus.status === "expired" && (
              <span className="bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Periode Berakhir (Teks Default Aktif)</span>
              </span>
            )}
            {scheduleStatus.status === "disabled" && (
              <span className="bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-full text-xs">
                Jadwal Nonaktif
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentSchedule.enabled}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  promoSchedule: {
                    ...currentSchedule,
                    enabled: e.target.checked,
                  },
                }))
              }
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-bold text-slate-800">
              Aktifkan Penjadwalan Otomatis Berdasarkan Tanggal
            </span>
          </label>

          {currentSchedule.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tanggal Mulai Tayang
                </label>
                <input
                  type="date"
                  value={currentSchedule.startDate}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      promoSchedule: {
                        ...currentSchedule,
                        startDate: e.target.value,
                      },
                    }))
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tanggal Berakhir Tayang
                </label>
                <input
                  type="date"
                  value={currentSchedule.endDate}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      promoSchedule: {
                        ...currentSchedule,
                        endDate: e.target.value,
                      },
                    }))
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Teks Badge Saat Promo Aktif
                </label>
                <input
                  type="text"
                  value={currentSchedule.promoBadgeText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, badge: val },
                      promoSchedule: {
                        ...currentSchedule,
                        promoBadgeText: val,
                      },
                    }));
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Contoh: 🔥 Promo Akhir Tahun: Diskon Lisensi s/d 45%"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Teks Badge Cadangan (Fallback saat Promo Berakhir)
                </label>
                <input
                  type="text"
                  value={currentSchedule.fallbackBadgeText}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      promoSchedule: {
                        ...currentSchedule,
                        fallbackBadgeText: e.target.value,
                      },
                    }))
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Contoh: ✨ Solusi Software Bisnis & Kasir Cloud Terpercaya untuk UMKM"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Teks ini otomatis menggantikan badge promo segera setelah tanggal berakhir lewat.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Layout className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Banner Utama (Hero Section)</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Badge Promo Kecil</label>
            <input
              type="text"
              value={data.hero.badge}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, badge: e.target.value },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Judul Utama Hero (H1)</label>
            <input
              type="text"
              value={data.hero.title}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, title: e.target.value },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Subjudul (Deskripsi Penjelas)
            </label>
            <textarea
              rows={3}
              value={data.hero.subtitle}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              URL Gambar Ilustrasi Hero
            </label>
            <input
              type="text"
              value={data.hero.heroImageUrl}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, heroImageUrl: e.target.value },
                }))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Testimonials Manager Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Kelola Testimoni Klien & Pengusaha
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kisah sukses pengguna yang tampil di landing page untuk membangun kepercayaan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddTestimonial}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Testimoni Baru</span>
          </button>
        </div>

        <div className="space-y-4">
          {(data.testimonials || []).map((testi, idx) => (
            <div
              key={testi.id || idx}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700">Testimoni #{idx + 1}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({testi.id})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTestimonial(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Hapus testimoni ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Testimoni</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Avatar Column */}
                <div className="sm:col-span-3 flex flex-col items-center sm:items-start gap-2.5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-200 bg-slate-100 shadow-xs shrink-0">
                    <Image
                      src={
                        testi.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={testi.authorName || "Avatar"}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="w-full space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Foto Avatar
                    </label>
                    <input
                      type="file"
                      id={`avatar-upload-${idx}`}
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => handleAvatarUpload(idx, e)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`avatar-upload-${idx}`}
                      className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-indigo-700 text-[11px] font-semibold cursor-pointer transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Ganti Foto</span>
                    </label>
                    <input
                      type="text"
                      placeholder="URL Foto..."
                      value={testi.avatarUrl}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], avatarUrl: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-600 mt-1"
                    />
                  </div>
                </div>

                {/* Details Column */}
                <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nama Klien / Pengusaha
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Hendra Wijaya"
                      value={testi.authorName}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], authorName: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Jabatan / Role
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Owner / Founder"
                      value={testi.role}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], role: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nama Usaha & Cabang
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Seduh (4 Outlet)"
                      value={testi.businessName}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], businessName: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Kategori Industri
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Food & Beverage"
                      value={testi.businessType}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], businessType: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  {/* Rating selector */}
                  <div className="sm:col-span-2 flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 text-xs">Rating Bintang:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const next = [...data.testimonials];
                            next[idx] = { ...next[idx], rating: star };
                            setData((prev) => ({ ...prev, testimonials: next }));
                          }}
                          className="p-1 hover:scale-110 transition cursor-pointer"
                          title={`${star} Bintang`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (testi.rating || 5)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {testi.rating || 5} / 5 Bintang
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Kutipan Cerita Testimoni
                    </label>
                    <textarea
                      rows={3}
                      value={testi.quote}
                      onChange={(e) => {
                        const next = [...data.testimonials];
                        next[idx] = { ...next[idx], quote: e.target.value };
                        setData((prev) => ({ ...prev, testimonials: next }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!data.testimonials || data.testimonials.length === 0) && (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs space-y-2">
              <p>Belum ada testimoni klien yang terdaftar.</p>
              <button
                type="button"
                onClick={handleAddTestimonial}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                + Tambah Testimoni Pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic FAQ Builder Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Kelola FAQ (Tanya Jawab Dinamis)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Bebas menambah atau menghapus pertanyaan FAQ tanpa batasan.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan FAQ</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {data.faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-700">Pertanyaan #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Hapus FAQ ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => {
                  const next = [...data.faqs];
                  next[idx] = { ...next[idx], question: e.target.value };
                  setData((prev) => ({ ...prev, faqs: next }));
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-900"
              />
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const next = [...data.faqs];
                  next[idx] = { ...next[idx], answer: e.target.value };
                  setData((prev) => ({ ...prev, faqs: next }));
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 pb-6 flex justify-end">
        <button
          type="button"
          onClick={() => onSave(data)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>
            {isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan Landing Page"}
          </span>
        </button>
      </div>
    </div>
  );
}
