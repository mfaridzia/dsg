import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. Leads Table (Marketing Prospects & UTM Attribution)
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  company: text("company"),
  interest: text("interest"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// 2. Landing Content Table (Editable Hero, Testimonials, FAQ)
export const landingContent = sqliteTable("landing_content", {
  id: text("id").primaryKey(), // 'main'
  heroBadge: text("hero_badge").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroImageUrl: text("hero_image_url").notNull(),
  ctaPrimaryText: text("cta_primary_text").notNull(),
  ctaPrimaryLink: text("cta_primary_link").notNull(),
  ctaSecondaryText: text("cta_secondary_text").notNull(),
  ctaSecondaryLink: text("cta_secondary_link").notNull(),
  faqsJson: text("faqs_json").notNull(),
  testimonialsJson: text("testimonials_json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// 3. Blog Posts Table (Editable Articles, Categories, Products Linking)
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  authorAvatarUrl: text("author_avatar_url").notNull(),
  readTimeMinutes: integer("read_time_minutes").notNull().default(5),
  linkedProductSlug: text("linked_product_slug"),
  status: text("status").notNull().default("published"), // 'published' | 'draft'
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type LandingContentRow = typeof landingContent.$inferSelect;
export type NewLandingContentRow = typeof landingContent.$inferInsert;

export type BlogPostRow = typeof blogPosts.$inferSelect;
export type NewBlogPostRow = typeof blogPosts.$inferInsert;
