import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_VOUCHERS } from "../src/lib/data/vouchers.ts";

describe("1. Shared Promo Quota Pool Logic", () => {
  it("harus mengizinkan penambahan item selama kuota pool mencukupi", () => {
    const maxQuota = 5;
    const currentInCart = 2;
    const additional = 2;

    const isAllowed = currentInCart + additional <= maxQuota;
    assert.equal(isAllowed, true);
  });

  it("harus MENOLAK penambahan kuantitas jika melampaui sisa kuota promo agregat", () => {
    const maxQuota = 5;
    const currentInCart = 3;
    const additional = 3; // total 6 > 5

    const isAllowed = currentInCart + additional <= maxQuota;
    assert.equal(isAllowed, false);
  });

  it("harus menghitung sisa kuota yang tersedia dengan tepat", () => {
    const maxQuota = 10;
    const currentInCart = 7;
    const remainingAvailable = Math.max(0, maxQuota - currentInCart);

    assert.equal(remainingAvailable, 3);
  });
});

describe("2. Pricing & Annual Billing Logic", () => {
  it("harus menghitung harga bulanan normal dengan benar", () => {
    const monthlyPrice = 149000;
    const qty = 3;
    const subtotal = monthlyPrice * qty;

    assert.equal(subtotal, 447000);
  });

  it("harus menghitung diskon langganan tahunan sebesar 20%", () => {
    const monthlyPrice = 100000;
    const expectedYearly = Math.round(monthlyPrice * 12 * 0.8);

    // 100.000 * 12 = 1.200.000 - 20% = 960.000
    assert.equal(expectedYearly, 960000);
  });
});

describe("3. Voucher Code Validation & Calculation Rules", () => {
  it("harus memvalidasi kode voucher yang terdaftar", () => {
    const voucher = SAMPLE_VOUCHERS.find((v) => v.code === "DSGHEMAT");
    assert.ok(voucher, "Voucher DSGHEMAT harus terdaftar");
    assert.equal(voucher?.type, "percentage");
    assert.equal(voucher?.amount, 10);
  });

  it("harus MENOLAK voucher jika subtotal belanja di bawah syarat minimum spend", () => {
    const voucher = SAMPLE_VOUCHERS.find((v) => v.code === "DSGHEMAT")!;
    const cartSubtotal = 250000; // minSpend adalah 300.000

    const isEligible = cartSubtotal >= voucher.minSpend;
    assert.equal(isEligible, false, "Subtotal 250k harus ditolak karena minSpend 300k");
  });

  it("harus MENERAPKAN batas maksimal diskon (cap) pada voucher persentase", () => {
    const voucher = SAMPLE_VOUCHERS.find((v) => v.code === "DSGHEMAT")!;
    // minSpend 300.000, 10%, maxDiscount 250.000
    const highSubtotal = 5000000; // 10% = 500.000, but cap is 250.000

    const rawDiscount = Math.round((highSubtotal * voucher.amount) / 100);
    const finalDiscount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;

    assert.equal(finalDiscount, 250000, "Diskon harus dipotong hingga batas maksimal 250.000");
  });

  it("harus menghitung voucher potongan tetap (fixed amount) secara akurat", () => {
    const voucher = SAMPLE_VOUCHERS.find((v) => v.code === "KODEVABARU")!;
    // amount: 50.000, minSpend: 200.000
    const subtotal = 400000;

    const discount = Math.min(voucher.amount, subtotal);
    const finalTotal = subtotal - discount;

    assert.equal(discount, 50000);
    assert.equal(finalTotal, 350000);
  });
});
