import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, ProductTier } from "@/types/marketplace";

export type CartStore = {
  items: CartItem[];
  // Quota overrides stored in client state so decrementing on checkout persists locally
  promoQuotaOverrides: Record<string, number>; // poolId -> remainingQuota

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
    quantity?: number
  ) => { success: boolean; error?: string };
  updateItemQuantity: (
    productId: string,
    tierId: string,
    delta: number
  ) => { success: boolean; error?: string };
  removeItem: (productId: string, tierId: string) => void;
  clearCart: () => void;

  // Checkout execution
  simulateOrderSuccess: () => void;

  // Calculated totals
  getSubtotal: () => number;
  getOriginalSubtotal: () => number;
  getTotalSavings: () => number;
  getTotalLicenseCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoQuotaOverrides: {},

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

      addItem: (product: Product, tier: ProductTier, quantity = 1) => {
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
          (i) => i.productId === product.id && i.tierId === tier.id
        );

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
            price: tier.priceMonthly,
            originalPrice: tier.originalPriceMonthly,
            quantity,
            maxSharedQuota: product.remainingPromoQuota,
          });
        }

        set({ items });
        return { success: true };
      },

      updateItemQuantity: (productId: string, tierId: string, delta: number) => {
        const items = [...get().items];
        const index = items.findIndex(
          (i) => i.productId === productId && i.tierId === tierId
        );

        if (index === -1) {
          return { success: false, error: "Item tidak ditemukan di keranjang." };
        }

        const targetItem = items[index];
        const newQty = targetItem.quantity + delta;

        if (newQty <= 0) {
          // Remove if reduced to 0
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

      removeItem: (productId: string, tierId: string) => {
        const items = get().items.filter(
          (i) => !(i.productId === productId && i.tierId === tierId)
        );
        set({ items });
      },

      clearCart: () => {
        set({ items: [] });
      },

      simulateOrderSuccess: () => {
        const items = get().items;
        const overrides = { ...get().promoQuotaOverrides };

        // Deduct purchased quantities from quota overrides so client persistence reflects the sale
        items.forEach((item) => {
          const currentQuota =
            overrides[item.sharedQuotaPoolId] !== undefined
              ? overrides[item.sharedQuotaPoolId]
              : item.maxSharedQuota;
          overrides[item.sharedQuotaPoolId] = Math.max(0, currentQuota - item.quantity);
        });

        set({ items: [], promoQuotaOverrides: overrides });
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
        return get().getOriginalSubtotal() - get().getSubtotal();
      },

      getTotalLicenseCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "kodeva-cart-storage",
      skipHydration: true, // Prevents SSR hydration mismatch
    }
  )
);
