import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(d);
}

export interface PromoScheduleInput {
  enabled: boolean;
  startDate: string;
  endDate: string;
  bannerText?: string;
  linkText?: string;
  linkUrl?: string;
  promoBadgeText?: string;
  fallbackBadgeText?: string;
}

export interface PromoScheduleStatus {
  isActive: boolean;
  status: "active" | "upcoming" | "expired" | "disabled";
  label: string;
  bannerText: string;
  linkText: string;
  linkUrl: string;
  badgeText: string;
  daysRemaining?: number;
}

export function getPromoScheduleStatus(
  schedule?: PromoScheduleInput,
  currentHeroBadge?: string
): PromoScheduleStatus {
  const defaultBanner =
    "Promo Akhir Tahun Kodeva: Amankan diskon lisensi hingga 45% sebelum kuota habis!";
  const bannerText =
    schedule?.bannerText ||
    schedule?.promoBadgeText ||
    currentHeroBadge ||
    defaultBanner;
  const linkText = schedule?.linkText || "Lihat Semua Produk →";
  const linkUrl = schedule?.linkUrl || "/marketplace";

  if (!schedule || !schedule.enabled) {
    return {
      isActive: false,
      status: "disabled",
      label: "Jadwal Dinonaktifkan (Banner Disembunyikan)",
      bannerText,
      linkText,
      linkUrl,
      badgeText: bannerText,
    };
  }

  const now = new Date();
  const start = schedule.startDate ? new Date(`${schedule.startDate}T00:00:00`) : null;
  const end = schedule.endDate ? new Date(`${schedule.endDate}T23:59:59`) : null;

  if (start && !isNaN(start.getTime()) && now < start) {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isActive: false,
      status: "upcoming",
      label: `Terjadwal (Tayang ${daysUntilStart} hari lagi)`,
      bannerText,
      linkText,
      linkUrl,
      badgeText: schedule.fallbackBadgeText || bannerText,
      daysRemaining: daysUntilStart,
    };
  }

  if (end && !isNaN(end.getTime()) && now > end) {
    return {
      isActive: false,
      status: "expired",
      label: "Periode Promo Telah Berakhir",
      bannerText,
      linkText,
      linkUrl,
      badgeText: schedule.fallbackBadgeText || bannerText,
      daysRemaining: 0,
    };
  }

  const daysLeft = end && !isNaN(end.getTime())
    ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : undefined;

  return {
    isActive: true,
    status: "active",
    label: daysLeft !== undefined ? `Sedang Tayang (Sisa ${daysLeft} hari)` : "Sedang Tayang",
    bannerText,
    linkText,
    linkUrl,
    badgeText: bannerText,
    daysRemaining: daysLeft,
  };
}

/**
 * Optimizes Open Graph image URLs for instant scraper previews (WhatsApp / Telegram).
 * Compresses Unsplash photos down to ~35-50KB with exact 800x420 aspect ratio.
 */
export function getOptimizedOgImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?auto=format&fit=crop&w=800&h=420&q=65`;
  }
  return url;
}
