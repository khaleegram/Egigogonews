import { NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { articleHref } from "@/lib/story";
import { sendPushToAll } from "@/lib/push";

/** External free cron hits this to publish scheduled articles. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  const ok =
    secret &&
    (header === `Bearer ${secret}` ||
      new URL(req.url).searchParams.get("secret") === secret);

  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();
  const due = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      and(eq(articles.status, "scheduled"), lte(articles.publishAt, now)),
    );

  for (const row of due) {
    await db
      .update(articles)
      .set({
        status: "published",
        publishedAt: now,
        publishAt: null,
        updatedAt: now,
      })
      .where(eq(articles.id, row.article.id));

    revalidatePath("/");
    revalidatePath(`/category/${row.category.slug}`);
    revalidatePath(articleHref(row.category.slug, row.article.slug));

    try {
      await sendPushToAll({
        title: row.article.title,
        body:
          row.article.dek?.trim() ||
          `${row.category.name} · Egigogo Newspaper`,
        url: articleHref(row.category.slug, row.article.slug),
      });
    } catch (err) {
      console.error("[cron/publish] push failed", err);
    }
  }

  return NextResponse.json({ ok: true, published: due.length });
}
