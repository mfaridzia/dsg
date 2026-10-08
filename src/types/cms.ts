export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  heroImageUrl: string;
  highlights: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  role: string;
  businessName: string;
  businessType: string;
  avatarUrl: string;
  quote: string;
  rating: number;
}

export interface PromoSchedule {
  enabled: boolean;
  startDate: string;
  endDate: string;
  promoBadgeText: string;
  fallbackBadgeText: string;
}

export interface LandingContent {
  hero: HeroContent;
  promoSchedule?: PromoSchedule;
  featuredProductIds: string[];
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  updatedAt?: number;
}

export interface LandingApiResponse {
  success: boolean;
  data?: LandingContent;
  error?: string;
}
