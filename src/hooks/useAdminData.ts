"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LandingContent, LandingApiResponse } from "@/types/cms";
import { BlogPost, BlogFormData, BlogsApiResponse } from "@/types/blog";
import { Lead, LeadsApiResponse } from "@/types/leads";
import { toast } from "sonner";

// =========================================================================
// 1. LANDING PAGE CONTENT (Query & Mutation)
// =========================================================================

export function useAdminLandingContent() {
  return useQuery({
    queryKey: ["admin", "landing-content"],
    queryFn: async (): Promise<LandingContent> => {
      const res = await fetch("/api/cms/landing", { cache: "no-store" });
      const data: LandingApiResponse = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "Gagal memuat konten landing page");
      }
      return data.data;
    },
  });
}

export function useUpdateLandingContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LandingContent) => {
      const res = await fetch("/api/cms/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menyimpan konten");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Konten landing page berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["admin", "landing-content"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menyimpan perubahan");
    },
  });
}

// =========================================================================
// 2. BLOGS MANAGEMENT (Query & Mutations)
// =========================================================================

export function useAdminBlogs() {
  return useQuery({
    queryKey: ["admin", "blogs"],
    queryFn: async (): Promise<BlogPost[]> => {
      const res = await fetch("/api/cms/blogs", { cache: "no-store" });
      const data: BlogsApiResponse = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "Gagal memuat daftar artikel");
      }
      return data.data;
    },
  });
}

export function useSaveBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id?: string; formData: BlogFormData }) => {
      const method = id ? "PUT" : "POST";
      const payload = id ? { id, ...formData } : formData;

      const res = await fetch("/api/cms/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menyimpan artikel");
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.id ? "Artikel berhasil diperbarui!" : "Artikel baru berhasil diterbitkan!");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menyimpan artikel");
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cms/blogs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menghapus artikel");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Artikel berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus artikel");
    },
  });
}

// =========================================================================
// 3. LEADS & CRM MANAGEMENT (Query)
// =========================================================================

export function useAdminLeads() {
  return useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async (): Promise<Lead[]> => {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data: LeadsApiResponse = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "Gagal memuat data leads");
      }
      return data.data;
    },
  });
}
