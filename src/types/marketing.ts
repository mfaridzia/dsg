export type UtmParameters = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export type GA4EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
};

export type GA4EventPayload = {
  event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase" | "click_cta";
  ecommerce?: {
    currency: "IDR";
    value: number;
    items: GA4EcommerceItem[];
  };
  cta_name?: string;
  cta_location?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  timestamp?: string;
};
