import { DEFAULT_LANDING_CONTENT, DEFAULT_BLOG_POSTS } from "../src/lib/data/cmsContent";
import fs from "fs";
import path from "path";

function escapeSql(str: string | null | undefined): string {
  if (!str) return "";
  return str.replace(/'/g, "''");
}

let sql = "-- Seed data for Cloudflare D1\n";

// 1. Landing Content
const hero = DEFAULT_LANDING_CONTENT.hero;
const faqs = JSON.stringify(DEFAULT_LANDING_CONTENT.faqs);
const testimonials = JSON.stringify(DEFAULT_LANDING_CONTENT.testimonials);
const now = Date.now();

sql += `INSERT OR REPLACE INTO landing_content (
  id, hero_badge, hero_title, hero_subtitle, hero_image_url,
  cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
  faqs_json, testimonials_json, updated_at
) VALUES (
  'main',
  '${escapeSql(hero.badge)}',
  '${escapeSql(hero.title)}',
  '${escapeSql(hero.subtitle)}',
  '${escapeSql(hero.heroImageUrl)}',
  '${escapeSql(hero.ctaPrimaryText)}',
  '${escapeSql(hero.ctaPrimaryLink)}',
  '${escapeSql(hero.ctaSecondaryText)}',
  '${escapeSql(hero.ctaSecondaryLink)}',
  '${escapeSql(faqs)}',
  '${escapeSql(testimonials)}',
  ${now}
);\n\n`;

// 2. Blog Posts
for (const p of DEFAULT_BLOG_POSTS) {
  const pubTime = new Date(p.publishedAt).getTime();
  const linked = p.linkedProductSlug ? `'${escapeSql(p.linkedProductSlug)}'` : "NULL";
  sql += `INSERT OR REPLACE INTO blog_posts (
    id, slug, title, category, excerpt, content, cover_image_url,
    author_name, author_role, author_avatar_url, read_time_minutes,
    linked_product_slug, status, published_at, updated_at
  ) VALUES (
    '${escapeSql(p.id)}',
    '${escapeSql(p.slug)}',
    '${escapeSql(p.title)}',
    '${escapeSql(p.category)}',
    '${escapeSql(p.excerpt)}',
    '${escapeSql(p.content)}',
    '${escapeSql(p.coverImageUrl)}',
    '${escapeSql(p.author.name)}',
    '${escapeSql(p.author.role)}',
    '${escapeSql(p.author.avatarUrl)}',
    ${p.readTimeMinutes},
    ${linked},
    'published',
    ${pubTime},
    ${now}
  );\n\n`;
}

const outputPath = path.join(process.cwd(), "drizzle", "seed-d1.sql");
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Successfully generated: ${outputPath}`);
