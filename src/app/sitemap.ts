import type { MetadataRoute } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, categories } from "@/db/schema";
import { articleHref } from "@/lib/story";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/ethics",
    "/privacy",
    "/terms",
    "/opinion",
    "/features",
    "/investigations",
    "/videos",
    "/archive",
    "/search",
    "/tips",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  try {
    const db = getDb();
    const rows = await db
      .select({
        slug: articles.slug,
        categorySlug: categories.slug,
        updatedAt: articles.updatedAt,
        publishedAt: articles.publishedAt,
        type: articles.type,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(5000);

    const storyRoutes: MetadataRoute.Sitemap = rows.map((r) => ({
      url: `${base}${articleHref(r.categorySlug, r.slug)}`,
      lastModified: r.updatedAt ?? r.publishedAt ?? new Date(),
    }));

    const sectionRoutes: MetadataRoute.Sitemap = [
      ...new Set(rows.map((r) => `/category/${r.categorySlug}`)),
    ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

    return [...staticRoutes, ...sectionRoutes, ...storyRoutes];
  } catch {
    return staticRoutes;
  }
}
