"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { articles, comments, notifications, users } from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";

const submitSchema = z.object({
  articleId: z.string().uuid(),
  displayName: z.string().min(2).max(80),
  email: z.string().email().max(255),
  body: z.string().min(10).max(5000),
});

export async function submitComment(raw: {
  articleId: string;
  displayName: string;
  email: string;
  body: string;
  honeypot?: string;
}) {
  if (raw.honeypot) {
    return {
      ok: true as const,
      message: "Thanks. Your comment is awaiting review.",
    };
  }

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid comment",
    };
  }

  const db = getDb();
  const [article] = await db
    .select({ id: articles.id, title: articles.title, status: articles.status })
    .from(articles)
    .where(eq(articles.id, parsed.data.articleId))
    .limit(1);

  if (!article || article.status !== "published") {
    return { ok: false as const, error: "Article not found" };
  }

  const [created] = await db
    .insert(comments)
    .values({
      articleId: parsed.data.articleId,
      displayName: parsed.data.displayName.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      body: parsed.data.body.trim(),
      status: "pending",
    })
    .returning();

  const editors = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.active, true), eq(users.role, "editor")));
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.active, true), eq(users.role, "admin")));

  const recipients = [...editors, ...admins];
  if (recipients.length && created) {
    await db.insert(notifications).values(
      recipients.map((u) => ({
        userId: u.id,
        kind: "comment" as const,
        title: `Comment on: ${article.title}`,
        link: `/cms/comments`,
      })),
    );
  }

  revalidatePath("/cms/comments");
  return {
    ok: true as const,
    message: "Thanks. Your comment is awaiting review.",
  };
}

export async function listApprovedComments(articleId: string) {
  const db = getDb();
  return db
    .select({
      id: comments.id,
      displayName: comments.displayName,
      body: comments.body,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(
      and(eq(comments.articleId, articleId), eq(comments.status, "approved")),
    )
    .orderBy(desc(comments.createdAt));
}

export async function listCommentsForModeration(
  status: "pending" | "approved" | "rejected" = "pending",
) {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return [];

  const db = getDb();
  return db
    .select({
      id: comments.id,
      displayName: comments.displayName,
      email: comments.email,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
      articleId: comments.articleId,
      articleTitle: articles.title,
    })
    .from(comments)
    .innerJoin(articles, eq(comments.articleId, articles.id))
    .where(eq(comments.status, status))
    .orderBy(desc(comments.createdAt));
}

export async function approveComment(id: string) {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const db = getDb();
  const [row] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!row) return { ok: false as const, error: "Comment not found" };

  await db
    .update(comments)
    .set({ status: "approved" })
    .where(eq(comments.id, id));

  revalidatePath("/cms/comments");
  return { ok: true as const };
}

export async function rejectComment(id: string) {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const db = getDb();
  const [row] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!row) return { ok: false as const, error: "Comment not found" };

  await db
    .update(comments)
    .set({ status: "rejected" })
    .where(eq(comments.id, id));

  revalidatePath("/cms/comments");
  return { ok: true as const };
}
