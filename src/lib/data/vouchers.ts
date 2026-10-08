import type { Voucher } from "../../types/marketplace.ts";

export const SAMPLE_VOUCHERS: Voucher[] = [
  {
    code: "DSGHEMAT",
    type: "percentage",
    amount: 10, // 10%
    minSpend: 300000,
    maxDiscount: 250000,
    remainingQuota: 50,
    description: "Diskon 10% s/d Rp 250.000 (Min. Belanja Rp 300.000)",
  },
  {
    code: "KODEVABARU",
    type: "fixed",
    amount: 50000, // Rp 50.000
    minSpend: 200000,
    remainingQuota: 100,
    description: "Potongan Langsung Rp 50.000 (Min. Belanja Rp 200.000)",
  },
  {
    code: "PROMOAKHIRTAHUN",
    type: "percentage",
    amount: 15, // 15%
    minSpend: 1000000,
    maxDiscount: 500000,
    remainingQuota: 25,
    description: "Diskon Spesial 15% s/d Rp 500.000 (Min. Belanja Rp 1.000.000)",
  },
];
