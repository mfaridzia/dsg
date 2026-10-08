import { GA4EventPayload, GA4EcommerceItem } from "@/types/marketing";
import { Product, ProductTier, CartItem } from "@/types/marketplace";

// In-memory record to prevent duplicate dispatches caused by component re-renders
const recentDispatches = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2500; // 2.5 seconds debounce for identical event fingerprints

// Custom event listeners for the in-app Visual Inspector
type DataLayerListener = (event: GA4EventPayload) => void;
const listeners = new Set<DataLayerListener>();

export function subscribeToDataLayer(listener: DataLayerListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Global dataLayer type declaration
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushToDataLayer(payload: GA4EventPayload, dedupeKey?: string): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  if (dedupeKey) {
    const lastSent = recentDispatches.get(dedupeKey);
    if (lastSent && now - lastSent < DEDUPE_WINDOW_MS) {
      console.log(`[GA4 dataLayer] Deduplicated (prevented duplicate trigger): ${dedupeKey}`);
      return false;
    }
    recentDispatches.set(dedupeKey, now);
  }

  window.dataLayer = window.dataLayer || [];
  const eventWithMeta: GA4EventPayload = {
    ...payload,
    timestamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  window.dataLayer.push(eventWithMeta);
  console.log(`[GA4 dataLayer Dispatched]:`, eventWithMeta);

  // Notify visual debugger
  listeners.forEach((listener) => listener(eventWithMeta));
  return true;
}

// Helper: Track CTA Click from Landing Page
export function trackCtaClick(
  ctaName: string,
  ctaLocation: string,
  extra?: { campaign?: string; utm_source?: string }
) {
  const dedupeKey = `cta_${ctaName}_${ctaLocation}`;
  pushToDataLayer(
    {
      event: "click_cta",
      cta_name: ctaName,
      cta_location: ctaLocation,
      campaign: extra?.campaign || "promo-akhir-tahun",
      utm_source: extra?.utm_source,
    },
    dedupeKey
  );
}

// Helper: Track Product Detail View (view_item)
export function trackViewItem(
  product: Product,
  selectedTier?: ProductTier,
  utm?: { utm_source?: string; utm_campaign?: string }
) {
  const activeTier = selectedTier || product.tiers[0];
  const dedupeKey = `view_item_${product.id}_${activeTier.id}`;

  const item: GA4EcommerceItem = {
    item_id: `${product.id}-${activeTier.id}`,
    item_name: `${product.name} (${activeTier.name})`,
    price: activeTier.priceMonthly,
    item_category: product.category,
    item_variant: activeTier.name,
    quantity: 1,
  };

  pushToDataLayer(
    {
      event: "view_item",
      ecommerce: {
        currency: "IDR",
        value: activeTier.priceMonthly,
        items: [item],
      },
      utm_source: utm?.utm_source,
      utm_campaign: utm?.utm_campaign,
    },
    dedupeKey
  );
}

// Helper: Track Add to Cart (add_to_cart)
export function trackAddToCart(
  product: Product,
  tier: ProductTier,
  quantity = 1,
  utm?: { utm_source?: string; utm_campaign?: string }
) {
  const item: GA4EcommerceItem = {
    item_id: `${product.id}-${tier.id}`,
    item_name: `${product.name} (${tier.name})`,
    price: tier.priceMonthly,
    item_category: product.category,
    item_variant: tier.name,
    quantity,
  };

  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "IDR",
      value: tier.priceMonthly * quantity,
      items: [item],
    },
    utm_source: utm?.utm_source,
    utm_campaign: utm?.utm_campaign,
  });
}

// Helper: Track Begin Checkout (begin_checkout)
export function trackBeginCheckout(
  items: CartItem[],
  subtotal: number,
  utm?: { utm_source?: string; utm_campaign?: string }
) {
  const dedupeKey = `begin_checkout_${items.length}_${subtotal}`;
  const ecommerceItems: GA4EcommerceItem[] = items.map((i) => ({
    item_id: `${i.productId}-${i.tierId}`,
    item_name: `${i.productName} (${i.tierName})`,
    price: i.price,
    quantity: i.quantity,
  }));

  pushToDataLayer(
    {
      event: "begin_checkout",
      ecommerce: {
        currency: "IDR",
        value: subtotal,
        items: ecommerceItems,
      },
      utm_source: utm?.utm_source,
      utm_campaign: utm?.utm_campaign,
    },
    dedupeKey
  );
}
