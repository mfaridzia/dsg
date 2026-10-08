"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import {
  ShoppingCart,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  Store,
  BookOpen,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalLicenseCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(false);
    // Slight timeout for clean hydration
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleNavClick = (ctaName: string) => {
    trackCtaClick(ctaName, "navbar");
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner Promo Akhir Tahun */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>
          <strong>Promo Akhir Tahun Kodeva:</strong> Amankan diskon lisensi hingga 45% sebelum kuota habis!
        </span>
        <Link
          href="/marketplace"
          onClick={() => trackCtaClick("banner_katalog_link", "top_announcement_bar")}
          className="underline hover:text-amber-200 transition font-semibold ml-1 hidden sm:inline"
        >
          Lihat Semua Produk →
        </Link>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => handleNavClick("logo_home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Kodeva
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200/60">
                  Cloud UMKM
                </span>
              </div>
              <span className="block text-[10px] text-slate-500 -mt-1 font-medium">
                by Digital Solusi Grup
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/"
              onClick={() => handleNavClick("nav_home")}
              className="hover:text-indigo-600 transition"
            >
              Beranda
            </Link>
            <Link
              href="/marketplace"
              onClick={() => handleNavClick("nav_marketplace")}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition text-slate-900 font-semibold"
            >
              <Store className="w-4 h-4 text-indigo-600" />
              Katalog Software & Promo
            </Link>
            <Link
              href="/blog"
              onClick={() => handleNavClick("nav_blog")}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              Blog Bisnis
            </Link>
            <Link
              href="/admin"
              onClick={() => handleNavClick("nav_admin_leads")}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Portal Admin & Leads
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              onClick={() => handleNavClick("nav_cart_icon")}
              className="relative p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 transition flex items-center justify-center"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalLicenseCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold text-[11px] min-w-5 h-5 rounded-full flex items-center justify-center px-1 shadow-md shadow-rose-600/30 animate-scale-in">
                  {totalLicenseCount}
                </span>
              )}
            </Link>

            {/* CTA Hubungi Sales / Konsultasi */}
            <Link
              href="/#lead-form"
              onClick={() => handleNavClick("nav_cta_consultation")}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              Konsultasi Demo
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
            <Link
              href="/"
              onClick={() => handleNavClick("mobile_nav_home")}
              className="block py-2 text-sm font-semibold text-slate-900 border-b border-slate-100"
            >
              Beranda
            </Link>
            <Link
              href="/marketplace"
              onClick={() => handleNavClick("mobile_nav_marketplace")}
              className="flex items-center justify-between py-2 text-sm font-semibold text-indigo-600 border-b border-slate-100"
            >
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4" /> Katalog & Promo Akhir Tahun
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                Diskon 45%
              </span>
            </Link>
            <Link
              href="/blog"
              onClick={() => handleNavClick("mobile_nav_blog")}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
            >
              <BookOpen className="w-4 h-4 text-slate-400" /> Blog & Panduan Bisnis
            </Link>
            <Link
              href="/cart"
              onClick={() => handleNavClick("mobile_nav_cart")}
              className="flex items-center justify-between py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-500" /> Keranjang Belanja
              </span>
              {mounted && totalLicenseCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalLicenseCount} lisensi
                </span>
              )}
            </Link>
            <Link
              href="/admin"
              onClick={() => handleNavClick("mobile_nav_admin")}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-600"
            >
              <LayoutDashboard className="w-4 h-4" /> Portal Admin & CMS
            </Link>
            <div className="pt-2">
              <Link
                href="/#lead-form"
                onClick={() => handleNavClick("mobile_cta_consultation")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
              >
                Konsultasi Demo Gratis
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
