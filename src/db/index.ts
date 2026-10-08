import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleProxy } from "drizzle-orm/sqlite-proxy";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { DEFAULT_LANDING_CONTENT, DEFAULT_BLOG_POSTS } from "@/lib/data/cmsContent";
import path from "path";
import os from "os";

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfDatabaseId = process.env.CLOUDFLARE_DATABASE_ID || process.env.CLOUDFLARE_D1_DATABASE_ID;
const cfApiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN;

const isCloudflareD1 = Boolean(cfAccountId && cfDatabaseId && cfApiToken);

export interface QueryClient {
  execute(query: string | { sql: string; args?: unknown[] }): Promise<{ rows: Record<string, unknown>[] }>;
}

let dbInstance: ReturnType<typeof drizzleLibsql> | ReturnType<typeof drizzleProxy>;
let clientInstance: QueryClient;

if (isCloudflareD1) {
  // Query Cloudflare D1 via REST API
  clientInstance = {
    async execute(query: string | { sql: string; args?: unknown[] }) {
      const sql = typeof query === "string" ? query : query.sql;
      const params = typeof query === "string" ? [] : query.args || [];
      const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/${cfDatabaseId}/query`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(`Cloudflare D1 Query Error: ${JSON.stringify(data.errors)}`);
      }
      return { rows: (data.result?.[0]?.results || []) as Record<string, unknown>[] };
    },
  };

  dbInstance = drizzleProxy(
    async (sql, params, method) => {
      const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/${cfDatabaseId}/raw`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(`Cloudflare D1 Error: ${JSON.stringify(data.errors)}`);
      }
      const rawRows = (data.result?.[0]?.results?.rows || []) as unknown[][];
      return { rows: rawRows };
    },
    { schema }
  );
} else {
  // Fallback to local SQLite / Libsql
  const defaultLocalDb = `file:${path.join(os.tmpdir(), "kodeva-edge-cms.db")}`;
  const databaseUrl = process.env.TURSO_DATABASE_URL || defaultLocalDb;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsqlClient = createClient({
    url: databaseUrl,
    authToken,
  });

  clientInstance = {
    async execute(query) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await libsqlClient.execute(query as any);
      return { rows: (res.rows || []) as Record<string, unknown>[] };
    },
  };

  dbInstance = drizzleLibsql(libsqlClient, { schema });
}

export const client = clientInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = dbInstance;


let isInitialized = false;

export async function ensureDatabaseTables() {
  if (isInitialized) return;

  try {
    // 1. Leads Table
    await client.execute(`
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
      )
    `);

    // 2. Landing Content Table
    await client.execute(`
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
      )
    `);

    // 3. Blog Posts Table
    await client.execute(`
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
      )
    `);

    // Seed default Landing Content if empty
    const existingLanding = await client.execute("SELECT id FROM landing_content WHERE id = 'main'");
    if (existingLanding.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO landing_content (
          id, hero_badge, hero_title, hero_subtitle, hero_image_url,
          cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
          faqs_json, testimonials_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          "main",
          DEFAULT_LANDING_CONTENT.hero.badge,
          DEFAULT_LANDING_CONTENT.hero.title,
          DEFAULT_LANDING_CONTENT.hero.subtitle,
          DEFAULT_LANDING_CONTENT.hero.heroImageUrl,
          DEFAULT_LANDING_CONTENT.hero.ctaPrimaryText,
          DEFAULT_LANDING_CONTENT.hero.ctaPrimaryLink,
          DEFAULT_LANDING_CONTENT.hero.ctaSecondaryText,
          DEFAULT_LANDING_CONTENT.hero.ctaSecondaryLink,
          JSON.stringify(DEFAULT_LANDING_CONTENT.faqs),
          JSON.stringify(DEFAULT_LANDING_CONTENT.testimonials),
          Date.now(),
        ],
      });
    }

    // Seed default Blog Posts if empty
    const existingBlog = await client.execute("SELECT id FROM blog_posts LIMIT 1");
    if (existingBlog.rows.length === 0) {
      for (const post of DEFAULT_BLOG_POSTS) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO blog_posts (
            id, slug, title, category, excerpt, content, cover_image_url,
            author_name, author_role, author_avatar_url, read_time_minutes,
            linked_product_slug, status, published_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            post.id,
            post.slug,
            post.title,
            post.category,
            post.excerpt,
            post.content,
            post.coverImageUrl,
            post.author.name,
            post.author.role,
            post.author.avatarUrl,
            post.readTimeMinutes,
            post.linkedProductSlug || null,
            "published",
            new Date(post.publishedAt).getTime(),
            Date.now(),
          ],
        });
      }
    }

    isInitialized = true;
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

// Backwards-compatible helper
export const ensureLeadsTable = ensureDatabaseTables;
