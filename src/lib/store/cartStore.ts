import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductTier, Voucher } from "@/types/marketplace";
import { SAMPLE_VOUCHERS } from "@/lib/data/vouchers";

export type CartStore = {
  items: CartItem[];
  // Quota overrides stored in client state so decrementing on checkout persists locally
  promoQuotaOverrides: Record<string, number>; // poolId -> remainingQuota
  appliedVoucher: Voucher | null;

  // Invariant checkers & getters
  getTotalPoolQuantity: (sharedQuotaPoolId: string) => number;
  getEffectivePoolQuota: (sharedQuotaPoolId: string, initialQuota: number) => number;
  canAddQuantity: (
    sharedQuotaPoolId: string,
    initialQuota: number,
    additionalQty: number
  ) => { allowed: boolean; currentTotal: number; maxAllowed: number; message?: string };

  // Cart operations
  addItem: (
    product: Product,
    tier: ProductTier,
    quantity?: number,
    billingCycle?: "monthly" | "yearly"
  ) => { success: boolean; error?: string };
  updateItemQuantity: (
    productId: string,
    tierId: string,
    delta: number,
    billingCycle?: "monthly" | "yearly"
  ) => { success: boolean; error?: string };
  removeItem: (productId: string, tierId: string, billingCycle?: "monthly" | "yearly") => void;
  clearCart: () => void;

  // Voucher operations
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  getVoucherDiscount: () => number;

  // Checkout execution
  simulateOrderSuccess: () => void;

  // Calculated totals
  getSubtotal: () => number;
  getOriginalSubtotal: () => number;
  getTotalSavings: () => number;
  getTotalLicenseCount: () => number;
  getFinalTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoQuotaOverrides: {},
      appliedVoucher: null,

      getTotalPoolQuantity: (sharedQuotaPoolId: string) => {
        return get().items
          .filter((item) => item.sharedQuotaPoolId === sharedQuotaPoolId)
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      getEffectivePoolQuota: (sharedQuotaPoolId: string, initialQuota: number) => {
        const overrides = get().promoQuotaOverrides;
        if (overrides[sharedQuotaPoolId] !== undefined) {
          return overrides[sharedQuotaPoolId];
        }
        return initialQuota;
      },

      canAddQuantity: (
        sharedQuotaPoolId: string,
        initialQuota: number,
        additionalQty: number
      ) => {
        const currentTotal = get().getTotalPoolQuantity(sharedQuotaPoolId);
        const maxAllowed = get().getEffectivePoolQuota(sharedQuotaPoolId, initialQuota);
        const projectedTotal = currentTotal + additionalQty;

        if (projectedTotal > maxAllowed) {
          const remainingAvailable = Math.max(0, maxAllowed - currentTotal);
          return {
            allowed: false,
            currentTotal,
            maxAllowed,
            message:
              remainingAvailable > 0
                ? `Kuota promo hanya tersisa ${remainingAvailable} lisensi lagi untuk produk ini (kombinasi seluruh pilihan paket).`
                : `Kuota promo untuk produk ini sudah habis (${maxAllowed} lisensi telah terisi di keranjang).`,
          };
        }

        return { allowed: true, currentTotal, maxAllowed };
      },

      addItem: (product: Product, tier: ProductTier, quantity = 1, billingCycle: "monthly" | "yearly" = "monthly") => {
        const poolId = product.sharedQuotaPoolId;
        const check = get().canAddQuantity(poolId, product.remainingPromoQuota, quantity);

        if (!check.allowed) {
          return {
            success: false,
            error: check.message || "Melebihi batas sisa kuota promo produk.",
          };
        }

        const items = [...get().items];
        const existingIndex = items.findIndex(
          (i) => i.productId === product.id && i.tierId === tier.id && (i.billingCycle || "monthly") === billingCycle
        );

        // Calculate price based on billing cycle (yearly gets 20% discount on 12 months)
        const price =
          billingCycle === "yearly"
            ? Math.round(tier.priceMonthly * 12 * 0.8)
            : tier.priceMonthly;
        const originalPrice =
          billingCycle === "yearly"
            ? tier.originalPriceMonthly * 12
            : tier.originalPriceMonthly;

        if (existingIndex > -1) {
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + quantity,
          };
        } else {
          items.push({
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            sharedQuotaPoolId: poolId,
            tierId: tier.id,
            tierName: tier.name,
            price,
            originalPrice,
            quantity,
            maxSharedQuota: product.remainingPromoQuota,
            billingCycle,
          });
        }

        set({ items });
        return { success: true };
      },

      updateItemQuantity: (productId: string, tierId: string, delta: number, billingCycle: "monthly" | "yearly" = "monthly") => {
        const items = [...get().items];
        const index = items.findIndex(
          (i) => i.productId === productId && i.tierId === tierId && (i.billingCycle || "monthly") === billingCycle
        );

        if (index === -1) {
          return { success: false, error: "Item tidak ditemukan di keranjang." };
        }

        const targetItem = items[index];
        const newQty = targetItem.quantity + delta;

        if (newQty <= 0) {
          items.splice(index, 1);
          set({ items });
          return { success: true };
        }

        if (delta > 0) {
          const check = get().canAddQuantity(
            targetItem.sharedQuotaPoolId,
            targetItem.maxSharedQuota,
            delta
          );
          if (!check.allowed) {
            return {
              success: false,
              error: check.message || "Batas kuota promo bersama tercapai.",
            };
          }
        }

        items[index] = { ...targetItem, quantity: newQty };
        set({ items });
        return { success: true };
      },

      removeItem: (productId: string, tierId: string, billingCycle: "monthly" | "yearly" = "monthly") => {
        const items = get().items.filter(
          (i) => !(i.productId === productId && i.tierId === tierId && (i.billingCycle || "monthly") === billingCycle)
        );
        set({ items });
      },

      clearCart: () => {
        set({ items: [], appliedVoucher: null });
      },

      applyVoucher: (code: string) => {
        const cleanCode = code.trim().toUpperCase();
        const voucher = SAMPLE_VOUCHERS.find((v) => v.code === cleanCode);

        if (!voucher) {
          return { success: false, message: "Kode voucher tidak ditemukan atau tidak valid." };
        }

        const subtotal = get().getSubtotal();
        if (subtotal < voucher.minSpend) {
          return {
            success: false,
            message: `Minimal belanja untuk voucher ini adalah Rp ${voucher.minSpend.toLocaleString("id-ID")}.`,
          };
        }

        if (voucher.remainingQuota <= 0) {
          return { success: false, message: "Kuota pemakaian voucher ini sudah habis." };
        }

        set({ appliedVoucher: voucher });
        return {
          success: true,
          message: `Voucher ${voucher.code} berhasil diterapkan!`,
        };
      },

      removeVoucher: () => {
        set({ appliedVoucher: null });
      },

      getVoucherDiscount: () => {
        const voucher = get().appliedVoucher;
        if (!voucher) return 0;

        const subtotal = get().getSubtotal();
        if (subtotal < voucher.minSpend) return 0;

        if (voucher.type === "fixed") {
          return Math.min(voucher.amount, subtotal);
        }

        if (voucher.type === "percentage") {
          const discount = Math.round((subtotal * voucher.amount) / 100);
          return voucher.maxDiscount ? Math.min(discount, voucher.maxDiscount) : discount;
        }

        return 0;
      },

      simulateOrderSuccess: () => {
        const items = get().items;
        const overrides = { ...get().promoQuotaOverrides };

        items.forEach((item) => {
          const currentQuota =
            overrides[item.sharedQuotaPoolId] !== undefined
              ? overrides[item.sharedQuotaPoolId]
              : item.maxSharedQuota;
          overrides[item.sharedQuotaPoolId] = Math.max(0, currentQuota - item.quantity);
        });

        set({ items: [], promoQuotaOverrides: overrides, appliedVoucher: null });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getOriginalSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.originalPrice * item.quantity,
          0
        );
      },

      getTotalSavings: () => {
        const promoSavings = get().getOriginalSubtotal() - get().getSubtotal();
        const voucherDiscount = get().getVoucherDiscount();
        return promoSavings + voucherDiscount;
      },

      getTotalLicenseCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getFinalTotal: () => {
        return Math.max(0, get().getSubtotal() - get().getVoucherDiscount());
      },
    }),
    {
      name: "kodeva-cart-storage",
      skipHydration: true,
    }
  )
);
