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
  promoBadgeText: string;
  fallbackBadgeText: string;
}

export interface PromoScheduleStatus {
  isActive: boolean;
  status: "active" | "upcoming" | "expired" | "disabled";
  label: string;
  badgeText: string;
  daysRemaining?: number;
}

export function getPromoScheduleStatus(
  schedule?: PromoScheduleInput,
  currentHeroBadge?: string
): PromoScheduleStatus {
  if (!schedule || !schedule.enabled) {
    return {
      isActive: true,
      status: "disabled",
      label: "Jadwal Dinonaktifkan (Selalu Aktif)",
      badgeText: currentHeroBadge || schedule?.promoBadgeText || "🔥 Promo Spesial Berlangsung",
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
      badgeText: schedule.fallbackBadgeText || "✨ Solusi Software Bisnis & Kasir Cloud Terpercaya untuk UMKM",
      daysRemaining: daysUntilStart,
    };
  }

  if (end && !isNaN(end.getTime()) && now > end) {
    return {
      isActive: false,
      status: "expired",
      label: "Periode Promo Telah Berakhir",
      badgeText: schedule.fallbackBadgeText || "✨ Solusi Software Bisnis & Kasir Cloud Terpercaya untuk UMKM",
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
    badgeText: schedule.promoBadgeText || currentHeroBadge || "🔥 Promo Spesial Berlangsung",
    daysRemaining: daysLeft,
  };
}
