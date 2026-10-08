"use client";

import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onToggleMobileMenu?: () => void;
}

export function AdminHeader({ activeTab, onToggleMobileMenu }: AdminHeaderProps) {
  const getTabLabel = () => {
    switch (activeTab) {
      case "overview":
        return "Dashboard";
      case "landing":
        return "Konten Landing Page";
      case "blogs":
        return "Manajemen Blog";
      case "leads":
        return "Data Leads & CRM";
      default:
        return "Admin";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          aria-label="Buka navigasi menu admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs text-slate-400 hidden sm:inline">Kodeva Admin</span>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {getTabLabel()}
        </span>
      </div>

      {/* Quick link on mobile header */}
      <Link
        href="/"
        target="_blank"
        className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
      >
        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
        <span className="text-[11px]">Web</span>
      </Link>
    </header>
  );
}
