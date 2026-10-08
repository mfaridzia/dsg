"use client";

import { Users, TrendingUp, BookOpen, Layers, Sparkles, Plus, Layout } from "lucide-react";
import { PRODUCTS } from "@/lib/data/products";
import { LandingContent } from "@/types/cms";
import { BlogPost } from "@/types/blog";
import { Lead } from "@/types/leads";
import { AdminTab } from "../AdminSidebar";

interface OverviewTabProps {
  landingData?: LandingContent;
  blogs: BlogPost[];
  leads: Lead[];
  setActiveTab: (tab: AdminTab) => void;
  onOpenNewBlog: () => void;
}

export function OverviewTab({
  landingData,
  blogs,
  leads,
  setActiveTab,
  onOpenNewBlog,
}: OverviewTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Data calon klien, publikasi artikel blog, dan konten website.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Leads Masuk</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{leads.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Valid (Anti-Spam)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Artikel Blog Aktif</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{blogs.length}</div>
          <div className="text-[11px] text-slate-500">Dipublikasikan</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Katalog Software</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{PRODUCTS.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold">Produk Siap Pakai</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pertanyaan FAQ</span>
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {landingData?.faqs.length ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Daftar pertanyaan aktif</div>
        </div>
      </div>

      {/* Quick Actions & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Leads Terbaru Masuk</h3>
              <p className="text-[11px] text-slate-400">
                Calon klien yang mengisi formulir konsultasi.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("leads")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Nama & Perusahaan</th>
                  <th className="px-5 py-3">Kontak WhatsApp</th>
                  <th className="px-5 py-3">Produk Diminati</th>
                  <th className="px-5 py-3">Sumber UTM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      <div>{lead.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {lead.company || "Pribadi / UMKM"}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600">{lead.whatsapp}</td>
                    <td className="px-5 py-3 text-slate-700">{lead.interest || "-"}</td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                        {lead.utmSource || "direct"}
                      </span>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-xs">
                      Belum ada leads masuk. Coba isi form konsultasi di beranda untuk menguji.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Aksi Cepat Dashboard</h3>

          <div className="space-y-2">
            <button
              onClick={onOpenNewBlog}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                  Tulis Artikel Blog Baru
                </div>
                <div className="text-[10px] text-slate-400">
                  Rilis artikel panduan bisnis / SEO
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("landing")}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                  Ubah Konten & Promo Beranda
                </div>
                <div className="text-[10px] text-slate-400">
                  Update Hero title, badge & FAQ
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
