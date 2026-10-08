"use client";

import Link from "next/link";
import { Shield, Sparkles, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-24 md:pb-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                K
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Kodeva</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ekosistem aplikasi bisnis cloud terintegrasi untuk akselerasi pertumbuhan UMKM Indonesia.
              Aplikasi kasir POS, payroll & HR, stok multi-gudang, dan sistem membership dalam satu genggaman.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Standar Keamanan Cloud ISO 27001 Certified</span>
            </div>
          </div>

          {/* Produk Software */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Solusi Software
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/marketplace/kodeva-pos-kasir" className="hover:text-white transition">
                  Kodeva POS Kasir Online
                </Link>
              </li>
              <li>
                <Link href="/marketplace/kodeva-hr-payroll" className="hover:text-white transition">
                  Kodeva HR & Payroll PPh 21
                </Link>
              </li>
              <li>
                <Link href="/marketplace/kodeva-inventory-sync" className="hover:text-white transition">
                  Smart Inventory Multi-Gudang
                </Link>
              </li>
              <li>
                <Link href="/marketplace/kodeva-akuntansi-keuangan" className="hover:text-white transition">
                  Akuntansi & Neraca Keuangan
                </Link>
              </li>
              <li>
                <Link href="/marketplace/kodeva-loyalty-member" className="hover:text-white transition">
                  Loyalty CRM & WhatsApp Promo
                </Link>
              </li>
            </ul>
          </div>

          {/* Sumber Daya & Edukasi */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Pusat Edukasi & Bantuan
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Artikel & Panduan Bisnis
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition">
                  Katalog Lisensi & Promo
                </Link>
              </li>
              <li>
                <Link href="/#faq-section" className="hover:text-white transition">
                  Tanya Jawab (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Portal Admin & CMS
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Alamat DSG */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>PT Digital Solusi Grup — Gedung Centennial Tower, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>021-29608319 / 0812-3334-5119</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>info@dsg.id / hendrawan.putra@dsg.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 Kodeva by PT Digital Solusi Grup. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-400 transition">
              Ketentuan Layanan
            </Link>
            <Link href="/" className="hover:text-slate-400 transition">
              Kebijakan Privasi
            </Link>
            <Link href="/admin" className="hover:text-slate-400 transition">
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
