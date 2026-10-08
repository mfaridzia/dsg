import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { getPromoScheduleStatus, type PromoScheduleInput } from "../src/lib/utils.ts";

describe("5. Promo Content Scheduling Logic (Bonus Feature)", () => {
  test("harus berstatus active jika tanggal hari ini berada di dalam periode promo", () => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const futureDate = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const schedule: PromoScheduleInput = {
      enabled: true,
      startDate: pastDate,
      endDate: futureDate,
      promoBadgeText: "🔥 Promo Aktif",
      fallbackBadgeText: "✨ Konten Normal",
    };

    const result = getPromoScheduleStatus(schedule);
    assert.equal(result.isActive, true);
    assert.equal(result.status, "active");
    assert.equal(result.badgeText, "🔥 Promo Aktif");
    assert.ok(result.daysRemaining !== undefined && result.daysRemaining >= 5);
  });

  test("harus berstatus upcoming jika tanggal mulai masih di masa depan", () => {
    const today = new Date();
    const futureStart = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const futureEnd = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const schedule: PromoScheduleInput = {
      enabled: true,
      startDate: futureStart,
      endDate: futureEnd,
      promoBadgeText: "🔥 Promo Mendatang",
      fallbackBadgeText: "✨ Konten Normal",
    };

    const result = getPromoScheduleStatus(schedule);
    assert.equal(result.isActive, false);
    assert.equal(result.status, "upcoming");
    assert.equal(result.badgeText, "✨ Konten Normal");
  });

  test("harus otomatis expired dan menampilkan teks fallback jika periode berakhir telah lewat", () => {
    const today = new Date();
    const pastStart = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const pastEnd = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const schedule: PromoScheduleInput = {
      enabled: true,
      startDate: pastStart,
      endDate: pastEnd,
      promoBadgeText: "🔥 Promo Lama",
      fallbackBadgeText: "✨ Solusi Terpercaya Normal",
    };

    const result = getPromoScheduleStatus(schedule);
    assert.equal(result.isActive, false);
    assert.equal(result.status, "expired");
    assert.equal(result.badgeText, "✨ Solusi Terpercaya Normal");
  });

  test("harus berstatus disabled jika penjadwalan dinonaktifkan oleh admin", () => {
    const schedule: PromoScheduleInput = {
      enabled: false,
      startDate: "2025-01-01",
      endDate: "2025-01-10",
      promoBadgeText: "🔥 Promo Nonaktif",
      fallbackBadgeText: "✨ Konten Biasa",
    };

    const result = getPromoScheduleStatus(schedule, "Fallback Badge Saat Ini");
    assert.equal(result.isActive, true);
    assert.equal(result.status, "disabled");
  });
});
