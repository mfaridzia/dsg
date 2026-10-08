"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Save,
  Upload,
  Link2,
  FileText,
  ImageIcon,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { BlogPost, BlogFormData } from "@/types/blog";
import { PRODUCTS } from "@/lib/data/products";
import QuillEditor from "@/components/admin/QuillEditor";
import { toast } from "sonner";

interface BlogManagerTabProps {
  blogs: BlogPost[];
  onSave: (payload: { id?: string; formData: BlogFormData }) => void;
  onDelete: (id: string) => void;
  isSaving: boolean;
  editingBlog: BlogPost | Partial<BlogPost> | null;
  setEditingBlog: React.Dispatch<React.SetStateAction<BlogPost | Partial<BlogPost> | null>>;
}

export function BlogManagerTab({
  blogs,
  onSave,
  onDelete,
  isSaving,
  editingBlog,
  setEditingBlog,
}: BlogManagerTabProps) {
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingBlog({
      title: "",
      slug: "",
      category: "Kasir & Operasional",
      excerpt: "",
      content: "",
      coverImageUrl:
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
      author: {
        name: "Tim Editorial Kodeva",
        role: "Business Specialist",
        avatarUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      },
      readTimeMinutes: 5,
      status: "published",
    });
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (!data.success || !data.url) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }
      setEditingBlog((prev) => (prev ? { ...prev, coverImageUrl: data.url } : prev));
      toast.success("Foto sampul artikel berhasil diunggah!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah gambar";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    if (!editingBlog.title || !editingBlog.slug) {
      toast.error("Judul dan slug URL wajib diisi!");
      return;
    }

    const formData: BlogFormData = {
      title: editingBlog.title,
      slug: editingBlog.slug,
      category: editingBlog.category || "Kasir & Operasional",
      excerpt: editingBlog.excerpt || "",
      content: editingBlog.content || "",
      coverImageUrl:
        editingBlog.coverImageUrl ||
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
      authorName: editingBlog.author?.name || "Tim Editorial Kodeva",
      authorRole: editingBlog.author?.role || "Business Specialist",
      authorAvatarUrl:
        editingBlog.author?.avatarUrl ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      readTimeMinutes: editingBlog.readTimeMinutes || 5,
      linkedProductSlug: editingBlog.linkedProductSlug,
      status: (editingBlog.status as "published" | "draft") || "published",
    };

    onSave({
      id: "id" in editingBlog ? editingBlog.id : undefined,
      formData,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Manajemen Artikel Blog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publikasikan artikel panduan bisnis, regulasi payroll, dan edukasi UMKM.
          </p>
        </div>

        {!editingBlog && (
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Artikel Baru</span>
          </button>
        )}
      </div>

      {/* CREATE / EDIT BLOG FORM */}
      {editingBlog && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                {"id" in editingBlog ? "Edit Artikel Blog" : "Tulis Artikel Baru"}
              </h3>
            </div>
            <button
              onClick={() => setEditingBlog(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup Form ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Judul Artikel</label>
              <input
                type="text"
                required
                value={editingBlog.title ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  setEditingBlog((prev) =>
                    prev
                      ? {
                          ...prev,
                          title: val,
                          ...(!("id" in prev) ? { slug: autoSlug } : {}),
                        }
                      : prev
                  );
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Slug URL (SEO Friendly)</label>
              <input
                type="text"
                required
                value={editingBlog.slug ?? ""}
                onChange={(e) =>
                  setEditingBlog((prev) => (prev ? { ...prev, slug: e.target.value } : prev))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-[11px] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kategori Artikel</label>
              <select
                value={editingBlog.category ?? "Kasir & Operasional"}
                onChange={(e) =>
                  setEditingBlog((prev) => (prev ? { ...prev, category: e.target.value } : prev))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
              >
                <option value="Kasir & Operasional">Kasir & Operasional</option>
                <option value="SDM & Regulasi">SDM & Regulasi</option>
                <option value="Operasional & Stok">Operasional & Stok</option>
                <option value="Marketing & CRM">Marketing & CRM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Status Publikasi</label>
              <select
                value={editingBlog.status ?? "published"}
                onChange={(e) =>
                  setEditingBlog((prev) =>
                    prev ? { ...prev, status: e.target.value as "published" | "draft" } : prev
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white"
              >
                <option value="published">Published (Tayang di Web)</option>
                <option value="draft">Draft (Disembunyikan)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Ringkasan Singkat (Excerpt)</label>
              <textarea
                rows={2}
                value={editingBlog.excerpt ?? ""}
                onChange={(e) =>
                  setEditingBlog((prev) => (prev ? { ...prev, excerpt: e.target.value } : prev))
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
              />
            </div>

            {/* WYSIWYG Editor */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Isi Konten Artikel (WYSIWYG Editor)</span>
              </label>
              <QuillEditor
                value={editingBlog.content ?? ""}
                onChange={(content) =>
                  setEditingBlog((prev) => (prev ? { ...prev, content } : prev))
                }
              />
            </div>

            {/* Cover Image Uploader */}
            <div className="sm:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Gambar Sampul Artikel (Cover Image)</span>
                  </label>
                </div>

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
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-xl p-4 text-center transition">
                  <input
                    type="file"
                    id="blog-image-upload-file"
                    accept="image/png, image/jpeg, image/webp"
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
                        <span className="text-xs font-semibold text-slate-700">
                          Pilih foto dari komputer
                        </span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <input
                  type="url"
                  value={editingBlog.coverImageUrl ?? ""}
                  onChange={(e) =>
                    setEditingBlog((prev) =>
                      prev ? { ...prev, coverImageUrl: e.target.value } : prev
                    )
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-[11px]"
                />
              )}

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
                    <div className="text-[11px] font-bold text-slate-700">
                      Preview Gambar Sampul
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {editingBlog.coverImageUrl}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Tautkan ke Produk Software</label>
              <select
                value={editingBlog.linkedProductSlug ?? ""}
                onChange={(e) =>
                  setEditingBlog((prev) =>
                    prev ? { ...prev, linkedProductSlug: e.target.value } : prev
                  )
                }
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
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan & Publikasikan"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BLOG ARTICLES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
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
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={
                          blog.coverImageUrl ||
                          "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt=""
                        fill
                        unoptimized={(blog.coverImageUrl || "").startsWith("data:")}
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
                  {blog.linkedProductSlug ? (
                    <span className="text-indigo-600 font-bold font-mono">
                      {blog.linkedProductSlug}
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
                      onClick={() => setEditingBlog(blog)}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                      title="Edit Artikel"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(blog.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Hapus Artikel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Belum ada artikel blog. Klik &quot;Tulis Artikel Baru&quot; di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
