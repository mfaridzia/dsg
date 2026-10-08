"use client";

import { useState } from "react";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLoginView } from "@/components/admin/AdminLoginView";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { LandingContentTab } from "@/components/admin/tabs/LandingContentTab";
import { BlogManagerTab } from "@/components/admin/tabs/BlogManagerTab";
import { LeadsManagerTab } from "@/components/admin/tabs/LeadsManagerTab";
import {
  useAdminLandingContent,
  useUpdateLandingContent,
  useAdminBlogs,
  useSaveBlog,
  useDeleteBlog,
  useAdminLeads,
} from "@/hooks/useAdminData";
import { BlogPost } from "@/types/blog";
import { toast } from "sonner";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("kodeva_admin_auth") === "true";
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [editingBlog, setEditingBlog] = useState<BlogPost | Partial<BlogPost> | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // TanStack Query Hooks
  const { data: landingData, isLoading: loadingLanding } = useAdminLandingContent();
  const updateLandingMutation = useUpdateLandingContent();

  const { data: blogs = [] } = useAdminBlogs();
  const saveBlogMutation = useSaveBlog();
  const deleteBlogMutation = useDeleteBlog();

  const { data: leads = [], isLoading: loadingLeads, refetch: refetchLeads } = useAdminLeads();

  // Handlers
  const handleLogout = () => {
    sessionStorage.removeItem("kodeva_admin_auth");
    setIsAuthenticated(false);
    toast.info("Anda telah keluar dari sesi Admin.");
  };

  const handleOpenNewBlog = () => {
    setActiveTab("blogs");
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
  };

  if (!isAuthenticated) {
    return <AdminLoginView onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen bg-slate-100 flex font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blogsCount={blogs.length}
        leadsCount={leads.length}
        onLogout={handleLogout}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader
          activeTab={activeTab}
          onToggleMobileMenu={() => setMobileNavOpen((prev) => !prev)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <OverviewTab
              landingData={landingData}
              blogs={blogs}
              leads={leads}
              setActiveTab={setActiveTab}
              onOpenNewBlog={handleOpenNewBlog}
            />
          )}

          {/* TAB 2: LANDING PAGE CONTENT */}
          {activeTab === "landing" && (
            <>
              {loadingLanding && !landingData ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Memuat konten landing page dari Cloudflare D1...
                </div>
              ) : landingData ? (
                <LandingContentTab
                  initialData={landingData}
                  onSave={(updated) => updateLandingMutation.mutate(updated)}
                  isSaving={updateLandingMutation.isPending}
                />
              ) : null}
            </>
          )}

          {/* TAB 3: BLOGS MANAGEMENT */}
          {activeTab === "blogs" && (
            <BlogManagerTab
              blogs={blogs}
              editingBlog={editingBlog}
              setEditingBlog={setEditingBlog}
              onSave={({ id, formData }) => {
                saveBlogMutation.mutate(
                  { id, formData },
                  { onSuccess: () => setEditingBlog(null) }
                );
              }}
              onDelete={(id) => {
                if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
                  deleteBlogMutation.mutate(id);
                }
              }}
              isSaving={saveBlogMutation.isPending}
            />
          )}

          {/* TAB 4: LEADS & CRM */}
          {activeTab === "leads" && (
            <LeadsManagerTab
              leads={leads}
              onRefresh={() => refetchLeads()}
              isLoading={loadingLeads}
            />
          )}
        </main>
      </div>
    </div>
  );
}
