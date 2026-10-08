"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatIDR } from "@/lib/utils";
import { Ticket, CheckCircle2, Tag } from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_VOUCHERS } from "@/lib/data/vouchers";

export function VoucherInput() {
  const [inputCode, setInputCode] = useState("");
  const cartStore = useCartStore();
  const appliedVoucher = cartStore.appliedVoucher;
  const voucherDiscount = cartStore.getVoucherDiscount();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const res = cartStore.applyVoucher(inputCode);
    if (res.success) {
      toast.success(res.message);
      setInputCode("");
    } else {
      toast.error(res.message);
    }
  };

  const handleRemove = () => {
    cartStore.removeVoucher();
    toast.info("Voucher dilepas dari keranjang.");
  };

  return (
    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-indigo-600" />
          <span>Kupon / Kode Voucher Promo</span>
        </span>
        {appliedVoucher && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Aktif
          </span>
        )}
      </div>

      {appliedVoucher ? (
        <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="font-mono font-black text-emerald-700 text-sm tracking-wider">
              {appliedVoucher.code}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Hemat: <strong className="text-emerald-600 font-mono">{formatIDR(voucherDiscount)}</strong> ({appliedVoucher.description})
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Hapus
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Contoh: DSGHEMAT"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-semibold placeholder:font-sans placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 uppercase transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
          >
            Terapkan
          </button>
        </form>
      )}

      {/* Available Voucher Hints */}
      {!appliedVoucher && (
        <div className="space-y-1 pt-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Voucher Promo Tersedia:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_VOUCHERS.map((v) => (
              <button
                key={v.code}
                type="button"
                onClick={() => {
                  const res = cartStore.applyVoucher(v.code);
                  if (res.success) toast.success(res.message);
                  else toast.error(res.message);
                }}
                className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-600" />
                <span>{v.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
