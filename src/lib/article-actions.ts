"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import {
  articleUpdates,
  articles,
  categories,
  notifications,
  users,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { publicActionError } from "@/lib/public-error";
import { articleHref, wordCountFromHtml } from "@/lib/story";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function plainTextFromHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFromBody(html: string | null | undefined, max = 220) {
  const text = plainTextFromHtml(html ?? "");
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["news", "opinion", "feature", "investigative"]),
  title: z.string().min(8).max(500),
  slug: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((s) => s ?? ""),
  dek: z.string().max(280).optional().or(z.literal("")),
  location: z.string().max(255).optional().or(z.literal("")),
  byline: z.string().max(255).optional().or(z.literal("")),
  categorySlug: z.string().min(1),
  bodyHtml: z.string().optional().or(z.literal("")),
  videoEmbedUrl: z.string().optional().or(z.literal("")),
  heroImageUrl: z.string().optional().or(z.literal("")),
  heroImageAlt: z.string().optional().or(z.literal("")),
  audioUrl: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  sponsored: z.boolean().optional(),
  seoTitle: z.string().max(500).optional().or(z.literal("")),
  seoDescription: z.string().max(500).optional().or(z.literal("")),
});

export type ArticleActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function requireStaffSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (!role || !["admin", "editor", "reporter"].includes(role)) return null;
  return {
    id: session.user.id,
    role: role as "admin" | "editor" | "reporter",
    name: session.user.name ?? "Staff",
  };
}

async function categoryIdForSlug(slug: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row?.id ?? null;
}

function revalidateArticlePaths(
  categorySlug: string,
  slug: string,
  type: string,
) {
  revalidatePath("/");
  revalidatePath(`/category/${categorySlug}`);
  revalidatePath(articleHref(categorySlug, slug));
  revalidatePath("/cms/articles");
  if (type === "opinion") revalidatePath("/opinion");
  if (type === "feature") revalidatePath("/features");
  if (type === "investigative") revalidatePath("/investigations");
  revalidatePath("/archive");
  revalidatePath("/videos");
}

function publishMissingFields(article: {
  dek: string | null;
  body: string | null;
  categoryId: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  bylineName: string | null;
}): string[] {
  const missing: string[] = [];
  if (!article.dek?.trim()) {
    missing.push("summary (one or two sentences under the headline)");
  }
  const bodyText = plainTextFromHtml(article.body ?? "");
  const words = wordCountFromHtml(article.body ?? "");
  if (bodyText.length < 100 || words < 20) {
    missing.push(
      `story body (write at least ~20 words — currently ${words} word${words === 1 ? "" : "s"})`,
    );
  }
  if (!article.categoryId) missing.push("category");
  if (!article.heroImageUrl?.trim()) missing.push("hero image");
  if (!article.bylineName?.trim()) missing.push("byline (author name)");
  return missing;
}

export async function saveArticleDraft(
  raw: z.infer<typeof saveSchema>,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in to save articles." };
  const authorId = staff.id;
  const staffName = staff.name;
  const staffRole = staff.role;

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const data = parsed.data;
  let slug =
    (data.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
      ? data.slug
      : null) ||
    slugify(data.title);
  if (!slug || slug.length < 3) {
    return { ok: false, error: "Title is too short to build a URL" };
  }

  const categoryId = await categoryIdForSlug(data.categorySlug);
  if (!categoryId) return { ok: false, error: "Unknown category" };

  const canFeature = staffRole === "admin" || staffRole === "editor";
  const dek = (data.dek || "").trim().slice(0, 280) || null;

  const db = getDb();
  const values = {
    type: data.type,
    title: data.title,
    slug,
    dek,
    body: data.bodyHtml || null,
    categoryId,
    bylineName: data.byline || staffName,
    location: data.location || null,
    videoEmbedUrl: data.videoEmbedUrl || null,
    heroImageUrl: data.heroImageUrl || null,
    heroImageAlt: data.heroImageUrl ? data.title : null,
    audioUrl: data.audioUrl || null,
    featured: canFeature ? (data.featured ?? false) : undefined,
    sponsored: canFeature ? (data.sponsored ?? false) : undefined,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    updatedAt: new Date(),
  };

  try {
    if (data.id) {
      const [existing] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, data.id))
        .limit(1);
      if (!existing) return { ok: false, error: "Article not found" };
      if (staffRole === "reporter" && existing.authorId !== authorId) {
        return { ok: false, error: "You can only edit your own articles" };
      }
      if (existing.status === "published" && staffRole === "reporter") {
        return { ok: false, error: "Reporters cannot edit published articles" };
      }

      // Keep existing slug on edit so URL doesn't thrash; only use new title slug if empty.
      const { featured, sponsored, slug: _ignoreSlug, ...rest } = values;
      await db
        .update(articles)
        .set({
          ...rest,
          slug: existing.slug,
          ...(canFeature
            ? { featured: featured ?? false, sponsored: sponsored ?? false }
            : {}),
          status:
            existing.status === "published" || existing.status === "scheduled"
              ? existing.status
              : existing.status === "in_review"
                ? "in_review"
                : "draft",
        })
        .where(eq(articles.id, data.id));

      revalidatePath(`/cms/articles/${data.id}`);
      return { ok: true, id: data.id };
    }

    async function insertWithSlug(candidate: string) {
      return db
        .insert(articles)
        .values({
          ...values,
          slug: candidate,
          featured: canFeature ? (data.featured ?? false) : false,
          sponsored: canFeature ? (data.sponsored ?? false) : false,
          authorId,
          status: "draft",
        })
        .returning();
    }

    let created;
    try {
      [created] = await insertWithSlug(slug);
    } catch (firstErr) {
      const causeBlob = (() => {
        const parts: string[] = [];
        let cur: unknown = firstErr;
        for (let i = 0; i < 4 && cur; i++) {
          if (cur instanceof Error) {
            parts.push(cur.message);
            cur = (cur as Error & { cause?: unknown }).cause;
          } else break;
        }
        return parts.join("\n").toLowerCase();
      })();
      const isSlugClash =
        causeBlob.includes("articles_slug") ||
        causeBlob.includes("duplicate key") ||
        causeBlob.includes("unique");
      if (!isSlugClash) throw firstErr;
      // Auto-unique: title-2, title-3…
      let saved = false;
      for (let n = 2; n <= 20; n++) {
        const next = `${slug.slice(0, 110)}-${n}`;
        try {
          [created] = await insertWithSlug(next);
          saved = true;
          break;
        } catch {
          /* try next */
        }
      }
      if (!saved) throw firstErr;
    }

    if (!created) return { ok: false, error: "Could not create article" };
    revalidatePath("/cms/articles");
    return { ok: true, id: created.id };
  } catch (err) {
    console.error("[saveArticleDraft]", err);
    return {
      ok: false,
      error: publicActionError(err, "Could not save the article. Please try again."),
    };
  }
}

export async function submitArticleForReview(
  id: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };

  const db = getDb();
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) return { ok: false, error: "Article not found" };
  if (staff.role === "reporter" && row.authorId !== staff.id) {
    return { ok: false, error: "Not your article" };
  }
  if (row.status !== "draft") {
    return { ok: false, error: "Only drafts can be submitted for review" };
  }
  if (!row.title || row.title.length < 8) {
    return { ok: false, error: "Title too short" };
  }

  await db
    .update(articles)
    .set({ status: "in_review", updatedAt: new Date() })
    .where(eq(articles.id, id));

  const editors = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.active, true), eq(users.role, "editor")));
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.active, true), eq(users.role, "admin")));

  const recipients = [...editors, ...admins];
  if (recipients.length) {
    await db.insert(notifications).values(
      recipients.map((u) => ({
        userId: u.id,
        kind: "review" as const,
        title: `Review: ${row.title}`,
        link: `/cms/articles/${id}`,
      })),
    );
  }

  revalidatePath(`/cms/articles/${id}`);
  revalidatePath("/cms/articles");
  return { ok: true, id };
}

export async function publishArticleNow(
  id: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };
  if (staff.role === "reporter") {
    return { ok: false, error: "Reporters cannot publish" };
  }

  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (!row) return { ok: false, error: "Article not found" };
  if (!row.article.title || row.article.title.length < 8) {
    return { ok: false, error: "Title required" };
  }

  const missingPre = publishMissingFields(row.article);
  // Auto-fill summary from the story if they left it blank.
  if (missingPre.includes("summary (one or two sentences under the headline)")) {
    const autoDek = summaryFromBody(row.article.body);
    if (autoDek) {
      await db
        .update(articles)
        .set({ dek: autoDek, updatedAt: new Date() })
        .where(eq(articles.id, id));
      row.article.dek = autoDek;
    }
  }

  const missing = publishMissingFields(row.article);
  if (missing.length) {
    return {
      ok: false,
      error: `Can't publish yet — ${missing.join("; ")}.`,
    };
  }

  const now = new Date();
  const wasPublished = row.article.status === "published";
  await db
    .update(articles)
    .set({
      status: "published",
      publishedAt: row.article.publishedAt ?? now,
      publishAt: null,
      unpublishedAt: null,
      updatedAt: now,
    })
    .where(eq(articles.id, id));

  revalidateArticlePaths(
    row.category.slug,
    row.article.slug,
    row.article.type,
  );
  revalidatePath(`/cms/articles/${id}`);

  if (!wasPublished) {
    const href = articleHref(row.category.slug, row.article.slug);
    try {
      const { sendPushToAll } = await import("@/lib/push");
      await sendPushToAll({
        title: row.article.title,
        body:
          row.article.dek?.trim() ||
          `${row.category.name} · Egigogo Newspaper`,
        url: href,
      });
    } catch (err) {
      console.error("[publish] push failed", err);
    }
  }

  return { ok: true, id };
}

export async function scheduleArticle(
  id: string,
  publishAtIso: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };
  if (staff.role === "reporter") {
    return { ok: false, error: "Reporters cannot schedule" };
  }

  const publishAt = new Date(publishAtIso);
  if (Number.isNaN(publishAt.getTime()) || publishAt.getTime() <= Date.now()) {
    return { ok: false, error: "publishAt must be a future datetime" };
  }

  const db = getDb();
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) return { ok: false, error: "Article not found" };
  if (!["draft", "in_review", "scheduled"].includes(row.status)) {
    return {
      ok: false,
      error: "Only draft, in_review, or scheduled articles can be scheduled",
    };
  }

  if (!row.dek?.trim()) {
    const autoDek = summaryFromBody(row.body);
    if (autoDek) {
      await db
        .update(articles)
        .set({ dek: autoDek, updatedAt: new Date() })
        .where(eq(articles.id, id));
      row.dek = autoDek;
    }
  }

  const missing = publishMissingFields(row);
  if (missing.length) {
    return {
      ok: false,
      error: `Can't schedule yet — ${missing.join("; ")}.`,
    };
  }

  await db
    .update(articles)
    .set({
      status: "scheduled",
      publishAt,
      unpublishedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  revalidatePath(`/cms/articles/${id}`);
  revalidatePath("/cms/articles");
  return { ok: true, id };
}

export async function returnToReporter(
  id: string,
  note: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };
  if (staff.role === "reporter") {
    return { ok: false, error: "Reporters cannot return articles" };
  }

  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "Editor note is required" };

  const db = getDb();
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) return { ok: false, error: "Article not found" };
  if (row.status !== "in_review") {
    return { ok: false, error: "Only in_review articles can be returned" };
  }

  await db
    .update(articles)
    .set({
      status: "draft",
      editorNote: trimmed,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  await db.insert(notifications).values({
    userId: row.authorId,
    kind: "review",
    title: `Returned: ${row.title}`,
    link: `/cms/articles/${id}`,
  });

  revalidatePath(`/cms/articles/${id}`);
  revalidatePath("/cms/articles");
  return { ok: true, id };
}

export async function unpublishArticle(
  id: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };
  if (staff.role === "reporter") {
    return { ok: false, error: "Reporters cannot unpublish" };
  }

  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (!row) return { ok: false, error: "Article not found" };
  if (row.article.status !== "published") {
    return { ok: false, error: "Only published articles can be unpublished" };
  }

  const now = new Date();
  await db
    .update(articles)
    .set({
      status: "unpublished",
      unpublishedAt: now,
      updatedAt: now,
    })
    .where(eq(articles.id, id));

  revalidateArticlePaths(
    row.category.slug,
    row.article.slug,
    row.article.type,
  );
  revalidatePath(`/cms/articles/${id}`);
  return { ok: true, id };
}

export async function addArticleUpdate(
  id: string,
  body: string,
): Promise<ArticleActionResult> {
  const staff = await requireStaffSession();
  if (!staff) return { ok: false, error: "Sign in required" };
  if (staff.role === "reporter") {
    return { ok: false, error: "Reporters cannot add updates" };
  }

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Update body is required" };

  const db = getDb();
  const [row] = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (!row) return { ok: false, error: "Article not found" };
  if (row.article.status !== "published") {
    return {
      ok: false,
      error: "Updates can only be added to published articles",
    };
  }

  await db.insert(articleUpdates).values({
    articleId: id,
    body: trimmed,
    createdBy: staff.id,
  });

  await db
    .update(articles)
    .set({ updatedAt: new Date() })
    .where(eq(articles.id, id));

  revalidateArticlePaths(
    row.category.slug,
    row.article.slug,
    row.article.type,
  );
  revalidatePath(`/cms/articles/${id}`);
  return { ok: true, id };
}

export async function saveAndRedirect(raw: z.infer<typeof saveSchema>) {
  const result = await saveArticleDraft(raw);
  if (!result.ok) return result;
  redirect(`/cms/articles/${result.id}`);
}
