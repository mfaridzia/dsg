"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lead } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/lib/data/products";
import {
  Users,
  Shield,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Target,
  ArrowRight,
  Database,
  CheckCircle2,
  FileText,
  Layout,
  Plus,
  Trash2,
  Edit3,
  Save,
  Lock,
  LogOut,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function AdminPortalPage() {
  // Demo Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State: 'leads' | 'landing' | 'blogs'
  const [activeTab, setActiveTab] = useState<"landing" | "blogs" | "leads">("landing");

  // --- 1. Leads Data State ---
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // --- 2. Landing Content State ---
  const [landingData, setLandingData] = useState<{
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      heroImageUrl: string;
      ctaPrimaryText: string;
      ctaPrimaryLink: string;
      ctaSecondaryText: string;
      ctaSecondaryLink: string;
    };
    faqs: { id: string; question: string; answer: string }[];
    testimonials: { id: string; authorName: string; role: string; businessName: string; quote: string }[];
  } | null>(null);
  const [savingLanding, setSavingLanding] = useState(false);
  const [landingSuccessMsg, setLandingSuccessMsg] = useState<string | null>(null);

  // --- 3. Blog Data State ---
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [blogSuccessMsg, setBlogSuccessMsg] = useState<string | null>(null);

  // Check auth session
  useEffect(() => {
    const authSession = sessionStorage.getItem("kodeva_admin_auth");
    if (authSession === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLandingContent();
      fetchBlogs();
      fetchLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginEmail === "admin@kodeva.com" && loginPassword === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("kodeva_admin_auth", "true");
      setLoginError(null);
    } else {
      setLoginError("Email atau password demo salah. Gunakan admin@kodeva.com / admin123");
    }
  };

  const handleAutoLoginDemo = () => {
    setLoginEmail("admin@kodeva.com");
    setLoginPassword("admin123");
    setIsAuthenticated(true);
    sessionStorage.setItem("kodeva_admin_auth", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("kodeva_admin_auth");
  };

  // --- Fetchers ---
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/leads");
      const json = await res.json();
      if (json.success) {
        setLeadsList(
          json.data.sort(
            (a: Lead, b: Lead) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchLandingContent = async () => {
    try {
      const res = await fetch("/api/cms/landing");
      const json = await res.json();
      if (json.success) {
        setLandingData(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const res = await fetch("/api/cms/blogs");
      const json = await res.json();
      if (json.success) {
        setBlogsList(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // --- Handlers ---
  const handleSaveLanding = async () => {
    if (!landingData) return;
    setSavingLanding(true);
    setLandingSuccessMsg(null);
    try {
      const res = await fetch("/api/cms/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landingData),
      });
      const json = await res.json();
      if (json.success) {
        setLandingSuccessMsg("✓ Konten beranda berhasil diperbarui dan direvalidasi!");
        setTimeout(() => setLandingSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLanding(false);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setSavingBlog(true);
    setBlogSuccessMsg(null);
    try {
      const res = await fetch("/api/cms/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog),
      });
      const json = await res.json();
      if (json.success) {
        setBlogSuccessMsg("✓ Artikel berhasil disimpan dan direvalidasi!");
        setEditingBlog(null);
        fetchBlogs();
        setTimeout(() => setBlogSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    try {
      await fetch(`/api/cms/blogs?id=${id}`, { method: "DELETE" });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6 text-white">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-600/30">
              K
            </div>
            <h1 className="text-xl font-bold">Portal Admin & CMS Kodeva</h1>
            <p className="text-xs text-slate-400">
              Masuk untuk mengelola konten landing page, blog, dan database leads.
            </p>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Kredensial Demo Reviewer DSG:
            </div>
            <div>Email: <code className="font-mono bg-black/40 px-1 rounded">admin@kodeva.com</code></div>
            <div>Password: <code className="font-mono bg-black/40 px-1 rounded">admin123</code></div>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@kodeva.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition shadow-lg shadow-indigo-600/30"
            >
              Masuk Dashboard
            </button>
          </form>

          <button
            type="button"
            onClick={handleAutoLoginDemo}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Klik Masuk Akun Demo Reviewer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Built-in Edge CMS (Cloudflare D1 & R2 Ready)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dasbor Manajemen Konten & Prospek Kodeva
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Lihat Website Live</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveTab("landing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "landing"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Editor Beranda & Promo</span>
          </button>

          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "blogs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manajemen Artikel Blog ({blogsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "leads"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Database Leads Masuk ({leadsList.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: LANDING PAGE CMS                                  */}
        {/* ======================================================== */}
        {activeTab === "landing" && landingData && (
          <div className="space-y-8 animate-fade-in">
            {landingSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{landingSuccessMsg}</span>
              </div>
            )}

            {/* Hero Section Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hero Section (Headline & Promo)</h3>
                  <p className="text-xs text-slate-500">Edit teks promosi utama yang tampil di atas halaman beranda.</p>
                </div>
                <button
                  onClick={handleSaveLanding}
                  disabled={savingLanding}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingLanding ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Promo Teks</label>
                  <input
                    type="text"
                    value={landingData.hero.badge}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        hero: { ...landingData.hero, badge: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Utama (Headline)</label>
                  <input
                    type="text"
                    value={landingData.hero.title}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        hero: { ...landingData.hero, title: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subjudul (Deskripsi)</label>
                  <textarea
                    rows={3}
                    value={landingData.hero.subtitle}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        hero: { ...landingData.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Gambar Hero (CDN / Cloudflare R2)</label>
                  <input
                    type="text"
                    value={landingData.hero.heroImageUrl}
                    onChange={(e) =>
                      setLandingData({
                        ...landingData,
                        hero: { ...landingData.hero, heroImageUrl: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Editor */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kelola FAQ (Tanya Jawab)</h3>
                  <p className="text-xs text-slate-500">Edit pertanyaan dan jawaban seputar software Kodeva.</p>
                </div>
                <button
                  onClick={handleSaveLanding}
                  disabled={savingLanding}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan FAQ</span>
                </button>
              </div>

              <div className="space-y-4">
                {landingData.faqs.map((faq, idx) => (
                  <div key={faq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-indigo-700">FAQ #{idx + 1}</div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...landingData.faqs];
                        newFaqs[idx].question = e.target.value;
                        setLandingData({ ...landingData, faqs: newFaqs });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...landingData.faqs];
                        newFaqs[idx].answer = e.target.value;
                        setLandingData({ ...landingData, faqs: newFaqs });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BLOG POSTS CMS                                    */}
        {/* ======================================================== */}
        {activeTab === "blogs" && (
          <div className="space-y-6 animate-fade-in">
            {blogSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{blogSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Artikel Blog Bisnis</h3>
                <p className="text-xs text-slate-500">Kelola artikel panduan kasir, payroll, dan strategi usaha UMKM.</p>
              </div>
              <button
                onClick={() =>
                  setEditingBlog({
                    title: "",
                    slug: "",
                    category: "Kasir & Operasional",
                    excerpt: "",
                    content: "",
                    coverImageUrl: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
                    linkedProductSlug: "kodeva-pos-kasir",
                    status: "published",
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>

            {/* Modal / Inline Editor for Blog Post */}
            {editingBlog && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-xl space-y-5 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {editingBlog.id ? "Edit Artikel Blog" : "Tambah Artikel Baru"}
                  </h4>
                  <button
                    onClick={() => setEditingBlog(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={handleSaveBlog} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Judul Artikel</label>
                    <input
                      type="text"
                      required
                      value={editingBlog.title}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          title: e.target.value,
                          slug: editingBlog.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Slug URL (SEO)</label>
                    <input
                      type="text"
                      required
                      value={editingBlog.slug}
                      onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Kategori</label>
                    <select
                      value={editingBlog.category}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                    >
                      <option value="Kasir & Operasional">Kasir & Operasional</option>
                      <option value="SDM & Regulasi">SDM & Regulasi</option>
                      <option value="Operasional & Stok">Operasional & Stok</option>
                      <option value="Marketing & CRM">Marketing & CRM</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Ringkasan Singkat (Excerpt)</label>
                    <textarea
                      rows={2}
                      value={editingBlog.excerpt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Isi Konten Artikel</label>
                    <textarea
                      rows={6}
                      required
                      value={editingBlog.content}
                      onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                      placeholder="Tulis artikel di sini..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tautkan Produk Marketplace</label>
                    <select
                      value={editingBlog.linkedProductSlug || ""}
                      onChange={(e) =>
                        setEditingBlog({ ...editingBlog, linkedProductSlug: e.target.value || null })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                    >
                      <option value="">-- Tidak Ada --</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status</label>
                    <select
                      value={editingBlog.status}
                      onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
                    >
                      <option value="published">Published (Tayang)</option>
                      <option value="draft">Draft (Disembunyikan)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingBlog}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                      {savingBlog ? "Menyimpan..." : "Simpan & Publikasikan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Blogs Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Judul & Kategori</th>
                    <th className="px-6 py-3.5">Slug URL</th>
                    <th className="px-6 py-3.5">Produk Terkait</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogsList.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{blog.title}</div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        /blog/{blog.slug}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {blog.linkedProductSlug || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            blog.status === "published"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingBlog(blog)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-indigo-600"
                            title="Edit Artikel"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LEADS INBOX                                       */}
        {/* ======================================================== */}
        {activeTab === "leads" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Database Leads Masuk (Prospek Demo)</h3>
                  <p className="text-xs text-slate-500">
                    Setiap pengisi formulir terekam lengkap dengan sumber kampanye UTM TikTok dan Instagram.
                  </p>
                </div>
                <button
                  onClick={fetchLeads}
                  disabled={loadingLeads}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {leadsList.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Belum ada leads yang masuk. Isi formulir konsultasi di halaman beranda untuk mencoba!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Nama & Kontak</th>
                      <th className="px-6 py-3.5">Perusahaan</th>
                      <th className="px-6 py-3.5">Minat Software</th>
                      <th className="px-6 py-3.5">Atribusi Kampanye (UTM)</th>
                      <th className="px-6 py-3.5 text-right">Waktu Masuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leadsList.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{lead.whatsapp}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {lead.company || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                            {lead.interest || "Konsultasi Umum"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px]">
                          {lead.utmSource ? (
                            <div className="space-y-0.5">
                              <span className="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {lead.utmSource}
                              </span>
                              {lead.utmCampaign && (
                                <div className="text-slate-500 text-[10px]">
                                  camp: {lead.utmCampaign}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Organik / Direct</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 font-mono text-[11px]">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
