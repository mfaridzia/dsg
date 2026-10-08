export type ProductTier = {
  id: "basic" | "pro" | "business";
  name: string;
  description: string;
  priceMonthly: number;
  originalPriceMonthly: number;
  features: string[];
  isPopular?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "Kasir & POS" | "SDM & Payroll" | "Operasional & Stok" | "Add-On";
  sharedQuotaPoolId: string; // The pool ID shared across tiers for promo quota enforcement
  initialPromoQuota: number;
  remainingPromoQuota: number;
  badges: string[];
  screenshots: {
    url: string;
    caption: string;
  }[];
  tiers: ProductTier[];
};

export type Voucher = {
  code: string;
  type: "percentage" | "fixed";
  amount: number;
  minSpend: number;
  maxDiscount?: number;
  remainingQuota: number;
  description: string;
};

export type CartItem = {
  productId: string;
  productSlug: string;
  productName: string;
  sharedQuotaPoolId: string;
  tierId: "basic" | "pro" | "business";
  tierName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  maxSharedQuota: number;
  billingCycle?: "monthly" | "yearly";
};
