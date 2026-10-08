"use client";

import Link from "next/link";
import Image from "next/image";
import { trackCtaClick } from "@/lib/analytics/dataLayer";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { LandingContent } from "@/lib/data/cmsContent";

interface HeroSectionProps {
  content: LandingContent["hero"];
}

export function HeroSection({ content }: HeroSectionProps) {
  const handlePrimaryCta = () => {
    trackCtaClick("hero_primary_katalog", "hero_section", {
      campaign: "promo-akhir-tahun",
    });
  };

  const handleSecondaryCta = () => {
    trackCtaClick("hero_secondary_konsultasi", "hero_section", {
      campaign: "promo-akhir-tahun",
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-200/30 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Promo Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{content.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {content.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {content.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={content.ctaPrimaryLink}
                onClick={handlePrimaryCta}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-98"
              >
                <span>{content.ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={content.ctaSecondaryLink}
                onClick={handleSecondaryCta}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all hover:border-slate-300"
              >
                <span>{content.ctaSecondaryText}</span>
              </Link>
            </div>

            {/* Highlights List */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-600 font-medium">
              {content.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Card Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                <Image
                  src={content.heroImageUrl}
                  alt="Dashboard Aplikasi Kasir dan HR Kodeva"
                  width={640}
                  height={420}
                  priority
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sistem Terenkripsi & Cloud Realtime</span>
                    </div>
                    <p className="text-sm font-bold">
                      Pantau Rekap Penjualan Kasir & Status Payroll Cabang
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Badge Widget */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white p-3.5 rounded-xl shadow-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  99%
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Uptime Server SLA</div>
                  <div className="text-[10px] text-slate-500">Aman untuk Operasional Harian</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
