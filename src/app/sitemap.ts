import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, categories } from "@/db/schema";
import { SEED_CATEGORIES } from "@/lib/constants";
import { siteUrl } from "@/lib/email";
import { articleHref } from "@/lib/story";

function origin() {
  return siteUrl("/").replace(/\/$/, "");
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = origin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { path: "", changeFrequency: "hourly", priority: 1 },
      { path: "/archive", changeFrequency: "hourly", priority: 0.8 },
      { path: "/opinion", changeFrequency: "daily", priority: 0.8 },
      { path: "/features", changeFrequency: "daily", priority: 0.8 },
      { path: "/investigations", changeFrequency: "daily", priority: 0.8 },
      { path: "/videos", changeFrequency: "daily", priority: 0.7 },
      { path: "/about", changeFrequency: "monthly", priority: 0.5 },
      { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
      { path: "/ethics", changeFrequency: "yearly", priority: 0.3 },
      { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
      { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
      { path: "/tips", changeFrequency: "monthly", priority: 0.4 },
    ] as const
  ).map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = SEED_CATEGORIES.map((cat) => ({
    url: `${base}/category/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  try {
    const db = getDb();
    const rows = await db
      .select({
        slug: articles.slug,
        categorySlug: categories.slug,
        updatedAt: articles.updatedAt,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(5000);

    const storyRoutes: MetadataRoute.Sitemap = rows.map((r) => ({
      url: `${base}${articleHref(r.categorySlug, r.slug)}`,
      lastModified: r.updatedAt ?? r.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...categoryRoutes, ...storyRoutes];
  } catch {
    return [...staticRoutes, ...categoryRoutes];
  }
}
