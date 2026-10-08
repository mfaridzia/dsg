"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Layout,
  BookOpen,
  Users,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";

export type AdminTab = "overview" | "landing" | "blogs" | "leads";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  blogsCount: number;
  leadsCount: number;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  blogsCount,
  leadsCount,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const renderSidebarContent = (isMobile: boolean) => (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              K
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight">
                Kodeva Cloud
              </div>
              <div className="text-[10px] text-indigo-400 font-mono">
                Edge Admin CMS
              </div>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>

          <button
            onClick={() => {
              setActiveTab("overview");
              if (isMobile) onCloseMobile?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("landing");
              if (isMobile) onCloseMobile?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "landing"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Konten Landing Page</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("blogs");
              if (isMobile) onCloseMobile?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
              {blogsCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("leads");
              if (isMobile) onCloseMobile?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "leads"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Leads Masuk & CRM</span>
            </div>
            {leadsCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                {leadsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Footer (User Info & Actions) */}
      <div className="p-3 border-t border-slate-800 space-y-2 shrink-0 bg-slate-900">
        <Link
          href="/"
          target="_blank"
          onClick={() => {
            if (isMobile) onCloseMobile?.();
          }}
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
              <div className="text-xs font-bold text-white truncate">
                Administrator
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                admin@kodeva.com
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              if (isMobile) onCloseMobile?.();
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar: Preserved exactly, visible on md and up */}
      <aside className="hidden md:flex w-64 h-screen bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 shrink-0 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer: Visible only when mobileOpen is true on small screens */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 md:hidden animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 select-none shadow-2xl md:hidden animate-slide-in">
            {renderSidebarContent(true)}
          </aside>
        </>
      )}
    </>
  );
}
