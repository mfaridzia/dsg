CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  company TEXT,
  interest TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS landing_content (
  id TEXT PRIMARY KEY,
  hero_badge TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  cta_primary_text TEXT NOT NULL,
  cta_primary_link TEXT NOT NULL,
  cta_secondary_text TEXT NOT NULL,
  cta_secondary_link TEXT NOT NULL,
  faqs_json TEXT NOT NULL,
  testimonials_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  author_avatar_url TEXT NOT NULL,
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  linked_product_slug TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
