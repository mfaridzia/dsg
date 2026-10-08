"use client";

import { AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
}

export function AdminHeader({ activeTab }: AdminHeaderProps) {
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
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">Kodeva Admin</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {getTabLabel()}
        </span>
      </div>
    </header>
  );
}
