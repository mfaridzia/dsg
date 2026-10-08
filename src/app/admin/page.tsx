"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Lead } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { PRODUCTS } from "@/lib/data/products";
import { toast } from "sonner";
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
  Upload,
  ImageIcon,
  Link2,
  Loader2,
  LayoutDashboard,
  BookOpen,
  Check,
  TrendingUp,
  Layers,
  Search,
  Filter,
} from "lucide-react";

// Dynamically import Quill editor without SSR to prevent document is not defined
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 border border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-xs gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
      <span>Memuat Editor WYSIWYG Quill...</span>
    </div>
  ),
});

interface BlogFormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  linkedProductSlug: string;
  status: string;
}

export default function AdminPortalPage() {
  // Demo Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Navigation Tab: 'overview' | 'landing' | 'blogs' | 'leads'
  const [activeTab, setActiveTab] = useState<"overview" | "landing" | "blogs" | "leads">("overview");

  // --- 1. Leads State ---
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

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

  // --- 3. Blog Data State ---
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogFormData | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check auth session on mount
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
      toast.success("Login berhasil! Selamat datang di Dashboard Admin Kodeva.");
    } else {
      setLoginError("Email atau password demo salah. Gunakan admin@kodeva.com / admin123");
      toast.error("Autentikasi gagal. Silakan gunakan kredensial demo.");
    }
  };

  const handleAutoLoginDemo = () => {
    setLoginEmail("admin@kodeva.com");
    setLoginPassword("admin123");
    setIsAuthenticated(true);
    sessionStorage.setItem("kodeva_admin_auth", "true");
    toast.success("Login demo 1-klik berhasil!");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("kodeva_admin_auth");
    toast.info("Anda telah keluar dari Dashboard Admin.");
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
      toast.error("Gagal memuat daftar leads.");
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
      toast.error("Gagal memuat artikel blog.");
    } finally {
      setLoadingBlogs(false);
    }
  };

  // --- Handlers ---
  const handleSaveLanding = async () => {
    if (!landingData) return;
    setSavingLanding(true);
    try {
      const res = await fetch("/api/cms/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(landingData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Konten landing page berhasil disimpan dan direvalidasi!");
      } else {
        toast.error("Gagal menyimpan perubahan landing page.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan saat menyimpan landing page.");
    } finally {
      setSavingLanding(false);
    }
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    if (!landingData) return;
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: "",
      answer: "",
    };
    setLandingData({
      ...landingData,
      faqs: [...landingData.faqs, newFaq],
    });
    toast.info("Pertanyaan FAQ baru ditambahkan. Klik 'Simpan FAQ' untuk menerapkan.");
  };

  const handleRemoveFaq = (idxToRemove: number) => {
    if (!landingData) return;
    const newFaqs = landingData.faqs.filter((_, idx) => idx !== idxToRemove);
    setLandingData({
      ...landingData,
      faqs: newFaqs,
    });
    toast.info("Pertanyaan FAQ dihapus dari daftar.");
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBlog) return;

    setUploadingImage(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setEditingBlog({ ...editingBlog, coverImageUrl: data.url });
        toast.success("Foto cover artikel berhasil diunggah!");
      } else {
        setUploadError(data.error || "Gagal mengunggah gambar.");
        toast.error(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Terjadi kesalahan saat mengunggah file gambar.");
      toast.error("Gagal terhubung ke upload server.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Create Blog Modal/Form
  const handleOpenNewBlog = () => {
    setEditingBlog({
      id: undefined,
      title: "",
      slug: "",
      category: "Kasir & Operasional",
      excerpt: "",
      content: "<p>Tuliskan panduan atau artikel bisnis lengkap di sini...</p>",
      coverImageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
      linkedProductSlug: "kodeva-pos-kasir",
      status: "published",
    });
    setImageInputMode("upload");
  };

  // Open Edit Blog Modal/Form
  const handleOpenEditBlog = (blog: any) => {
    setEditingBlog({
      id: blog.id,
      title: blog.title ?? "",
      slug: blog.slug ?? "",
      category: blog.category ?? "Kasir & Operasional",
      excerpt: blog.excerpt ?? "",
      content: blog.content ?? "",
      coverImageUrl:
        blog.coverImageUrl ??
        blog.cover_image_url ??
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
      linkedProductSlug: blog.linkedProductSlug ?? blog.linked_product_slug ?? "",
      status: blog.status ?? "published",
    });
    setImageInputMode("upload");
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setSavingBlog(true);
    try {
      const res = await fetch("/api/cms/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBlog),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Artikel "${editingBlog.title}" berhasil disimpan dan direvalidasi!`);
        setEditingBlog(null);
        fetchBlogs();
      } else {
        toast.error("Gagal menyimpan artikel blog.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;
    try {
      const res = await fetch(`/api/cms/blogs?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Artikel berhasil dihapus dari sistem.");
        fetchBlogs();
      } else {
        toast.error("Gagal menghapus artikel.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menghapus artikel.");
    }
  };

  // Filtered Leads
  const filteredLeads = leadsList.filter((lead) => {
    const q = leadSearch.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.whatsapp.includes(q) ||
      (lead.company && lead.company.toLowerCase().includes(q))
    );
  });

  // =========================================================================
  // LOGIN SCREEN (Clean Minimalist Auth Gate)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl space-y-6 text-white">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-600/30">
              K
            </div>
            <h1 className="text-xl font-bold">Portal Dashboard Admin Kodeva</h1>
            <p className="text-xs text-slate-400">
              Kelola landing page, publikasi artikel blog, dan pantau database leads UMKM.
            </p>
          </div>

          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Kredensial Demo Reviewer:
            </div>
            <div>
              Email: <code className="font-mono bg-black/40 px-1 rounded">admin@kodeva.com</code>
            </div>
            <div>
              Password: <code className="font-mono bg-black/40 px-1 rounded">admin123</code>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Email Administrator</label>
              <input
                type="email"
                required
                value={loginEmail ?? ""}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@kodeva.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword ?? ""}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-600/30 text-xs"
              >
                Masuk ke Dashboard
              </button>

              <button
                type="button"
                onClick={handleAutoLoginDemo}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition text-xs border border-slate-700"
              >
                Isi Kredensial Demo (1-Klik)
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-slate-400 hover:text-indigo-400 text-xs inline-flex items-center gap-1 transition"
            >
              <span>← Kembali ke Halaman Utama</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED DASHBOARD LAYOUT (Full SaaS Layout with Sidebar)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION                                    */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              K
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight">Kodeva Cloud</div>
              <div className="text-[10px] text-indigo-400 font-mono">Edge Admin CMS</div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="p-3 space-y-1">
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Menu Utama
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("landing")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "landing"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Konten Landing Page</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "blogs"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Manajemen Blog</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                {blogsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "leads"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Leads Masuk & CRM</span>
              </div>
              {leadsList.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {leadsList.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Footer (User Info & Actions) */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lihat Website Beranda</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Administrator</div>
                <div className="text-[10px] text-slate-400 truncate">admin@kodeva.com</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA                                          */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Kodeva Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "landing" && "Konten Landing Page"}
              {activeTab === "blogs" && "Manajemen Blog"}
              {activeTab === "leads" && "Data Leads & CRM"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "blogs" && (
              <button
                onClick={handleOpenNewBlog}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Artikel</span>
              </button>
            )}
          </div>
        </header>

        {/* Inner Page View */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW / DASHBOARD                               */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Dashboard
                </h1>
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
                  <div className="text-2xl font-black text-slate-900">{leadsList.length}</div>
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
                  <div className="text-2xl font-black text-slate-900">{blogsList.length}</div>
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
                      <p className="text-[11px] text-slate-400">Calon klien yang mengisi formulir konsultasi.</p>
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
                        {leadsList.slice(0, 5).map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/60">
                            <td className="px-5 py-3 font-semibold text-slate-800">
                              <div>{lead.name}</div>
                              <div className="text-[10px] text-slate-400">{lead.company || "Pribadi / UMKM"}</div>
                            </td>
                            <td className="px-5 py-3 font-mono text-slate-600">{lead.whatsapp}</td>
                            <td className="px-5 py-3 text-slate-700">{lead.interest}</td>
                            <td className="px-5 py-3">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                                {(lead as any).utmSource || (lead as any).utm_source || "direct"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {leadsList.length === 0 && (
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
                      onClick={handleOpenNewBlog}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                          Tulis Artikel Blog Baru
                        </div>
                        <div className="text-[10px] text-slate-400">Editor WYSIWYG Quill & Cover Upload</div>
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
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                          Edit Hero & FAQ Landing
                        </div>
                        <div className="text-[10px] text-slate-400">Ubah promo banner & tambah FAQ</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("leads")}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                          Ekspor / Pantau Data Leads
                        </div>
                        <div className="text-[10px] text-slate-400">Atribusi UTM first-touch & kontak</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: KONTEN LANDING PAGE & FAQ BUILDER                   */}
          {/* ========================================================= */}
          {activeTab === "landing" && landingData && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Editor Konten Landing Page
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perubahan langsung diperbarui pada halaman beranda.
                </p>
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
                      value={landingData.hero.badge ?? ""}
                      onChange={(e) =>
                        setLandingData({
                          ...landingData,
                          hero: { ...landingData.hero, badge: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Judul Utama Hero (H1)</label>
                    <input
                      type="text"
                      value={landingData.hero.title ?? ""}
                      onChange={(e) =>
                        setLandingData({
                          ...landingData,
                          hero: { ...landingData.hero, title: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subjudul (Deskripsi Penjelas)</label>
                    <textarea
                      rows={3}
                      value={landingData.hero.subtitle ?? ""}
                      onChange={(e) =>
                        setLandingData({
                          ...landingData,
                          hero: { ...landingData.hero, subtitle: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">URL Gambar Ilustrasi Hero</label>
                    <input
                      type="text"
                      value={landingData.hero.heroImageUrl ?? ""}
                      onChange={(e) =>
                        setLandingData({
                          ...landingData,
                          hero: { ...landingData.hero, heroImageUrl: e.target.value },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic FAQ Builder Section */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-slate-900 text-sm">Kelola FAQ (Tanya Jawab Dinamis)</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bebas menambah atau menghapus jumlah FAQ tanpa batasan statis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Pertanyaan FAQ</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {landingData.faqs.map((faq, idx) => (
                    <div key={faq.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700">Pertanyaan #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center gap-1 text-[11px]"
                          title="Hapus FAQ ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: Apakah aplikasi kasir ini bisa cetak struk offline?"
                        value={faq.question ?? ""}
                        onChange={(e) => {
                          const newFaqs = [...landingData.faqs];
                          newFaqs[idx].question = e.target.value;
                          setLandingData({ ...landingData, faqs: newFaqs });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-900"
                      />
                      <textarea
                        rows={2}
                        placeholder="Tuliskan jawaban lengkap yang menjawab keraguan calon klien..."
                        value={faq.answer ?? ""}
                        onChange={(e) => {
                          const newFaqs = [...landingData.faqs];
                          newFaqs[idx].answer = e.target.value;
                          setLandingData({ ...landingData, faqs: newFaqs });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 text-xs"
                      />
                    </div>
                  ))}

                  {landingData.faqs.length === 0 && (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs space-y-2">
                      <p>Belum ada pertanyaan FAQ.</p>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        + Tambah FAQ Sekarang
                      </button>
                    </div>
                  )}

                  {landingData.faqs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 text-indigo-600 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah FAQ Lainnya</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tombol Simpan Tunggal di Bagian Paling Bawah */}
              <div className="pt-2 pb-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveLanding}
                  disabled={savingLanding}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingLanding ? "Menyimpan Perubahan..." : "Simpan Perubahan Landing Page"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MANAJEMEN BLOG & WYSIWYG EDITOR                     */}
          {/* ========================================================= */}
          {activeTab === "blogs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Manajemen Artikel Blog
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tulis dan publikasikan artikel blog, kelola gambar sampul, dan tautkan ke produk software.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewBlog}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tulis Artikel Baru</span>
                </button>
              </div>

              {/* BLOG EDITOR DRAWER / CARD (WYSIWYG QUILL) */}
              {editingBlog && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-xl space-y-6 animate-scale-in">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {editingBlog.id ? "Edit Artikel Blog" : "Tulis Artikel Baru"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {editingBlog.id ? `ID: ${editingBlog.id}` : "Gunakan editor WYSIWYG untuk format teks rapi"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100"
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
                        value={editingBlog.title ?? ""}
                        onChange={(e) =>
                          setEditingBlog({
                            ...editingBlog,
                            title: e.target.value,
                            slug: editingBlog.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                          })
                        }
                        placeholder="Contoh: 5 Tips Mengoptimalkan Pembukuan Kasir Cafe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Slug URL (SEO Friendly)</label>
                      <input
                        type="text"
                        required
                        value={editingBlog.slug ?? ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-[11px] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kategori Artikel</label>
                      <select
                        value={editingBlog.category ?? "Kasir & Operasional"}
                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
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
                        value={editingBlog.excerpt ?? ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                        placeholder="Ringkasan 1-2 kalimat untuk preview kartu blog..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                      />
                    </div>

                    {/* WYSIWYG QUILL EDITOR */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Isi Konten Artikel (WYSIWYG Editor Quill.js)</span>
                      </label>
                      <QuillEditor
                        value={editingBlog.content ?? ""}
                        onChange={(content) => setEditingBlog({ ...editingBlog, content })}
                        placeholder="Tuliskan artikel lengkap di sini. Gunakan Heading 2/3 untuk sub-bab agar hierarki tipografi rapi..."
                      />
                    </div>

                    {/* DUAL COVER IMAGE UPLOADER */}
                    <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                            <span>Gambar Sampul Artikel (Cover Image)</span>
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Upload file dari komputer Anda atau pilih URL gambar Unsplash.
                          </p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold w-fit">
                          <button
                            type="button"
                            onClick={() => setImageInputMode("upload")}
                            className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                              imageInputMode === "upload"
                                ? "bg-white text-indigo-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload File</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageInputMode("url")}
                            className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                              imageInputMode === "url"
                                ? "bg-white text-indigo-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Link2 className="w-3 h-3" />
                            <span>URL Gambar</span>
                          </button>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {imageInputMode === "upload" ? (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-4 text-center transition">
                            <input
                              type="file"
                              id="blog-image-upload-file"
                              accept="image/png, image/jpeg, image/webp, image/gif"
                              onChange={handleFileUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                            <label
                              htmlFor="blog-image-upload-file"
                              className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2"
                            >
                              {uploadingImage ? (
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs py-2">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span>Mengunggah file gambar...</span>
                                </div>
                              ) : (
                                <>
                                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Upload className="w-5 h-5" />
                                  </div>
                                  <div className="text-xs font-semibold text-slate-700">
                                    <span className="text-indigo-600 underline">Pilih foto dari komputer</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">
                                    Mendukung JPG, PNG, WebP (Tersimpan otomatis ke sistem)
                                  </p>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="url"
                            value={editingBlog.coverImageUrl ?? ""}
                            onChange={(e) => setEditingBlog({ ...editingBlog, coverImageUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px]"
                          />

                          {/* Unsplash Presets */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Preset Pilihan Unsplash Terverifikasi:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: "Kasir Resto", url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80" },
                                { label: "Retail Mart", url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80" },
                                { label: "Payroll HR", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" },
                                { label: "Gudang Stok", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" },
                              ].map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setEditingBlog({ ...editingBlog, coverImageUrl: preset.url })}
                                  className="px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-semibold transition"
                                >
                                  + {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Preview */}
                      {editingBlog.coverImageUrl && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-3">
                          <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <Image
                              src={editingBlog.coverImageUrl}
                              alt="Preview cover"
                              fill
                              unoptimized={editingBlog.coverImageUrl.startsWith("data:")}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-slate-700">Preview Gambar Sampul Aktif</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {editingBlog.coverImageUrl}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Tautkan ke Produk Software</label>
                      <select
                        value={editingBlog.linkedProductSlug ?? ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, linkedProductSlug: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
                      >
                        <option value="">-- Tanpa Tautan Produk --</option>
                        {PRODUCTS.map((p) => (
                          <option key={p.id} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Status Publikasi</label>
                      <select
                        value={editingBlog.status ?? "published"}
                        onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
                      >
                        <option value="published">Published (Tayang di Web)</option>
                        <option value="draft">Draft (Disembunyikan)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingBlog ? "Menyimpan..." : "Simpan & Publikasikan"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* BLOG ARTICLES TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Artikel & Cover</th>
                      <th className="px-6 py-3.5">Kategori</th>
                      <th className="px-6 py-3.5">Produk Terkait</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blogsList.map((blog) => (
                      <tr key={blog.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <Image
                                src={blog.coverImageUrl || blog.cover_image_url || "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"}
                                alt=""
                                fill
                                unoptimized={(blog.coverImageUrl || blog.cover_image_url || "").startsWith("data:")}
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 leading-snug line-clamp-1">
                                {blog.title}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                /blog/{blog.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-[11px]">
                          {blog.linkedProductSlug || blog.linked_product_slug ? (
                            <span className="text-indigo-600 font-bold font-mono">
                              {blog.linkedProductSlug || blog.linked_product_slug}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              blog.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                              title="Buka Artikel"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleOpenEditBlog(blog)}
                              className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                              title="Edit Artikel"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id, blog.title)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              title="Hapus Artikel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blogsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          {loadingBlogs ? "Memuat artikel..." : "Belum ada artikel. Klik 'Tulis Artikel Baru'."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: LEADS INBOX & UTM ATTRIBUTION                      */}
          {/* ========================================================= */}
          {activeTab === "leads" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Database Leads Masuk & Tracking CRM
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data calon klien terintegrasi dengan UTM First-Touch Attribution untuk evaluasi ROI channel iklan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama, email, whatsapp..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-56"
                    />
                  </div>
                  <button
                    onClick={fetchLeads}
                    disabled={loadingLeads}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* LEADS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Kontak Klien</th>
                      <th className="px-6 py-3.5">Perusahaan</th>
                      <th className="px-6 py-3.5">Kebutuhan Software</th>
                      <th className="px-6 py-3.5">Atribusi UTM Iklan</th>
                      <th className="px-6 py-3.5">Waktu Submit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{lead.whatsapp}</span>
                            <span>•</span>
                            <span>{lead.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {lead.company || <span className="text-slate-400 italic">Pribadi</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-indigo-100">
                            {lead.interest}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-0.5 text-[11px]">
                            <div className="font-mono font-bold text-slate-800">
                              {(lead as any).utmSource || (lead as any).utm_source || "organic / direct"}
                            </div>
                            {((lead as any).utmMedium || (lead as any).utm_medium || (lead as any).utmCampaign || (lead as any).utm_campaign) && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {(lead as any).utmMedium || (lead as any).utm_medium || "-"} / {(lead as any).utmCampaign || (lead as any).utm_campaign || "-"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-[11px]">
                          {formatDate(new Date(lead.createdAt).toISOString())}
                        </td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          {loadingLeads ? "Memuat database leads..." : "Tidak ada data leads yang cocok."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
