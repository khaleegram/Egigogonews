import { and, desc, eq, ilike, notInArray, or, sql } from "drizzle-orm";
import { getDb, withDbRetry } from "@/db";
import { articles, breaking, categories, users } from "@/db/schema";
import {
  articleHref,
  formatPublishedLabel,
  placeholderImage,
  type Story,
} from "@/lib/story";

type ArticleRow = typeof articles.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;

function toStory(
  article: ArticleRow,
  category: Pick<CategoryRow, "slug" | "name">,
): Story {
  const bodyHtml = article.body ?? undefined;
  return {
    id: article.id,
    href: articleHref(category.slug, article.slug),
    category: category.name,
    categorySlug: category.slug,
    title: article.title,
    dek: article.dek ?? "",
    imageUrl: article.heroImageUrl || placeholderImage(),
    imageAlt: article.heroImageAlt || article.title,
    publishedLabel: formatPublishedLabel(article.publishedAt),
    viewCount: article.viewCount,
    byline: article.bylineName ?? undefined,
    type: article.type,
    hasVideo: Boolean(article.videoEmbedUrl),
    videoEmbedUrl: article.videoEmbedUrl ?? undefined,
    audioUrl: article.audioUrl ?? undefined,
    bodyHtml,
    location: article.location ?? undefined,
    sponsored: article.sponsored,
    publishedAt: article.publishedAt,
  };
}

const published = eq(articles.status, "published");

export async function listPublishedStories(opts?: {
  limit?: number;
  categorySlug?: string;
  type?: ArticleRow["type"];
  withVideo?: boolean;
  excludeIds?: string[];
  orderBy?: "latest" | "trending";
}): Promise<Story[]> {
  const db = getDb();
  const limit = opts?.limit ?? 20;
  const conditions = [published];

  if (opts?.type) conditions.push(eq(articles.type, opts.type));
  if (opts?.withVideo) {
    conditions.push(sql`${articles.videoEmbedUrl} is not null and ${articles.videoEmbedUrl} <> ''`);
  }
  if (opts?.excludeIds?.length) {
    conditions.push(notInArray(articles.id, opts.excludeIds));
  }
  if (opts?.categorySlug) {
    conditions.push(eq(categories.slug, opts.categorySlug));
  }

  const order =
    opts?.orderBy === "trending"
      ? desc(articles.viewCount)
      : desc(articles.publishedAt);

  const rows = await withDbRetry(() =>
    db
      .select({ article: articles, category: categories })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(order)
      .limit(limit),
  );

  return rows.map((r) => toStory(r.article, r.category));
}

export async function getFeaturedStories(limit = 3): Promise<Story[]> {
  const db = getDb();
  const rows = await withDbRetry(() =>
    db
      .select({ article: articles, category: categories })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(and(published, eq(articles.featured, true)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit),
  );

  if (rows.length > 0) {
    return rows.map((r) => toStory(r.article, r.category));
  }

  return listPublishedStories({ limit, orderBy: "latest" });
}

export async function getPublishedBySlug(
  categorySlug: string,
  slug: string,
): Promise<Story | null> {
  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(published, eq(categories.slug, categorySlug), eq(articles.slug, slug)),
    )
    .limit(1);

  return row ? toStory(row.article, row.category) : null;
}

export async function getArticleForCms(id: string) {
  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);
  return row ?? null;
}

export async function listCmsArticles(opts?: {
  authorId?: string;
  limit?: number;
}) {
  const db = getDb();
  const conditions = opts?.authorId
    ? [eq(articles.authorId, opts.authorId)]
    : [];

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      type: articles.type,
      status: articles.status,
      updatedAt: articles.updatedAt,
      slug: articles.slug,
      categorySlug: categories.slug,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(articles.updatedAt))
    .limit(opts?.limit ?? 100);

  return rows;
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function incrementArticleViews(id: string) {
  const db = getDb();
  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, id));
}

export async function getAuthorName(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.name ?? null;
}

export async function getActiveBreaking() {
  return withDbRetry(async () => {
    const db = getDb();
    const [row] = await db
      .select()
      .from(breaking)
      .where(eq(breaking.id, 1))
      .limit(1);
    if (!row || !row.active || !row.headline) return null;
    return { headline: row.headline, href: row.url || "/" };
  });
}

export async function searchPublishedStories(query: string, limit = 40) {
  const q = query.trim();
  if (!q) return [] as Story[];
  const db = getDb();
  const pattern = `%${q}%`;
  const rows = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(
        published,
        or(ilike(articles.title, pattern), ilike(articles.dek, pattern)),
      ),
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return rows.map((r) => toStory(r.article, r.category));
}

export async function getPublishedByTypeAndSlug(
  type: ArticleRow["type"],
  slug: string,
): Promise<Story | null> {
  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(published, eq(articles.type, type), eq(articles.slug, slug)))
    .limit(1);
  return row ? toStory(row.article, row.category) : null;
}
