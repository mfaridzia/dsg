"use client";

import { useEffect, useState } from "react";
import { subscribeToDataLayer } from "@/lib/analytics/dataLayer";
import { useUtmStore } from "@/lib/store/utmStore";
import { GA4EventPayload } from "@/types/marketing";
import { Activity, ChevronDown, Sparkles, Trash2 } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";

export function DataLayerInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<GA4EventPayload[]>([]);
  const utmStore = useUtmStore();
  const mounted = useIsMounted();

  useEffect(() => {
    // Hydrate UTM store on client
    useUtmStore.persist.rehydrate();

    const unsubscribe = subscribeToDataLayer((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

  const activeUtm = utmStore.getUtmPayload();
  const hasUtm = Object.keys(activeUtm).length > 0;

  const simulateTikTok = () => {
    const params = new URLSearchParams({
      utm_source: "tiktok",
      utm_medium: "paid_video",
      utm_campaign: "promo-akhir-tahun-umkm",
    });
    utmStore.captureFromUrl(params);
  };

  const simulateInstagram = () => {
    const params = new URLSearchParams({
      utm_source: "instagram",
      utm_medium: "story_swipe_up",
      utm_campaign: "diskon-kasir-45",
    });
    utmStore.captureFromUrl(params);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs">
      {/* Floating Toggle Pill */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-full shadow-xl border border-slate-700 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          title="Klik untuk membuka GA4 & UTM Inspector (Testing Tool)"
        >
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-medium">DataLayer Inspector</span>
          {events.length > 0 && (
            <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {events.length}
            </span>
          )}
          {hasUtm && (
            <span className="bg-sky-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              UTM
            </span>
          )}
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[520px]">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="font-semibold text-white text-xs">GA4 & UTM Inspector</h4>
                <p className="text-[10px] text-slate-400">Verifikasi Event & Atribusi Marketing</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEvents([])}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                title="Hapus Log Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Tutup Panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active UTM Bar */}
          <div className="p-3 bg-slate-900/50 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-sky-400">Active UTM Attribution</span>
              {hasUtm && (
                <button
                  onClick={() => utmStore.clearUtm()}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                >
                  Reset
                </button>
              )}
            </div>
            {hasUtm ? (
              <div className="bg-slate-900 rounded p-2 text-[11px] font-mono text-slate-300 space-y-0.5">
                {activeUtm.utm_source && (
                  <div>
                    <span className="text-slate-500">source:</span> {activeUtm.utm_source}
                  </div>
                )}
                {activeUtm.utm_medium && (
                  <div>
                    <span className="text-slate-500">medium:</span> {activeUtm.utm_medium}
                  </div>
                )}
                {activeUtm.utm_campaign && (
                  <div>
                    <span className="text-slate-500">campaign:</span> {activeUtm.utm_campaign}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 italic">
                Belum ada UTM tersimpan di session. Klik tombol simulasi di bawah untuk menguji:
              </div>
            )}

            {/* Quick Test Links */}
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={simulateTikTok}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-pink-400" /> Simulasikan TikTok
              </button>
              <button
                onClick={simulateInstagram}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Simulasikan IG
              </button>
            </div>
          </div>

          {/* Events Log List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-[11px] font-semibold text-emerald-400 mb-1">
              Dispatched dataLayer Events ({events.length})
            </div>

            {events.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-6">
                Belum ada event terkirim. Coba klik tombol CTA di landing page atau buka produk di katalog.
              </div>
            ) : (
              events.map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800/80 rounded p-2 text-[10px] font-mono hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span className="text-emerald-400">event: &quot;{ev.event}&quot;</span>
                    <span className="text-slate-500 font-normal">{ev.timestamp}</span>
                  </div>
                  {ev.ecommerce && (
                    <div className="text-slate-300">
                      <div>value: Rp {ev.ecommerce.value.toLocaleString("id-ID")}</div>
                      {ev.ecommerce.items.map((item, i) => (
                        <div key={i} className="text-slate-400 pl-2">
                          • {item.item_name} (x{item.quantity || 1})
                        </div>
                      ))}
                    </div>
                  )}
                  {ev.cta_name && (
                    <div className="text-slate-300">
                      cta: &quot;{ev.cta_name}&quot; ({ev.cta_location})
                    </div>
                  )}
                  {(ev.utm_source || ev.utm_campaign) && (
                    <div className="text-sky-400 text-[9px] mt-0.5">
                      utm: {ev.utm_source} / {ev.utm_campaign}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
