"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw, Download } from "lucide-react";
import { Lead } from "@/types/leads";
import { formatDate } from "@/lib/utils";

interface LeadsManagerTabProps {
  leads: Lead[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function LeadsManagerTab({
  leads,
  onRefresh,
  isLoading,
}: LeadsManagerTabProps) {
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.whatsapp.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.interest && lead.interest.toLowerCase().includes(q))
    );
  }, [leads, search]);

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const headers = [
      "ID",
      "Nama",
      "Email",
      "WhatsApp",
      "Perusahaan",
      "Minat Produk",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Tanggal Submit",
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.whatsapp}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${(l.interest || "").replace(/"/g, '""')}"`,
      `"${l.utmSource || ""}"`,
      `"${l.utmMedium || ""}"`,
      `"${l.utmCampaign || ""}"`,
      `"${new Date(l.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kodeva_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Database Leads Masuk & Tracking CRM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data calon klien terintegrasi dengan UTM First-Touch Attribution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, email, wa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 justify-end sm:justify-start shrink-0">
            <button
              onClick={handleExportCsv}
              disabled={leads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
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
                    {lead.interest || "Konsultasi Umum"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5 text-[11px]">
                    <div className="font-mono font-bold text-slate-800">
                      {lead.utmSource || "organic / direct"}
                    </div>
                    {(lead.utmMedium || lead.utmCampaign) && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {lead.utmMedium || "-"} / {lead.utmCampaign || "-"}
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
                  {isLoading ? "Memuat database leads..." : "Tidak ada data leads yang cocok."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
