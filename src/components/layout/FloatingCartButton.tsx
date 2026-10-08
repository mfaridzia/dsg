"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatIDR } from "@/lib/utils";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

function FloatingCartButtonContent() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const pathname = usePathname();

  useEffect(() => {
    useCartStore.persist.rehydrate();
    const timer = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(timer);
  }, []);

  // Do not show on /cart, /checkout, or /admin pages
  if (!mounted || items.length === 0 || pathname === "/cart" || pathname === "/checkout" || pathname?.startsWith("/admin")) {
    return null;
  }

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getSubtotal();

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40 animate-slide-up">
      <Link
        href="/cart"
        className="flex items-center justify-between gap-4 bg-slate-900/95 hover:bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-98 group max-w-md mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-indigo-600 rounded-xl text-white">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalQty}
            </span>
          </div>
          <div>
            <div className="text-xs text-slate-300 font-medium">
              {totalQty} Lisensi Software di Keranjang
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {formatIDR(subtotal)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition pr-1">
          <span>Lihat Keranjang</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}

export function FloatingCartButton() {
  return (
    <Suspense fallback={null}>
      <FloatingCartButtonContent />
    </Suspense>
  );
}
