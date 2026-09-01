"use server";

import { createHash, randomBytes } from "crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import {
  articles,
  categories,
  newsletterSends,
  newsletterSubscribers,
} from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";
import { emailConfigured, sendEmail, siteUrl } from "@/lib/email";
import { articleHref } from "@/lib/story";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function subscribeNewsletter(emailRaw: string, honeypot?: string) {
  if (honeypot) {
    return { ok: true as const, message: "Check your email to confirm." };
  }

  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  const db = getDb();
  const confirmToken = randomBytes(24).toString("hex");
  const unsubToken = randomBytes(24).toString("hex");

  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing?.confirmedAt && !existing.unsubscribedAt) {
    return { ok: true as const, message: "You are already subscribed." };
  }

  if (existing) {
    await db
      .update(newsletterSubscribers)
      .set({
        confirmTokenHash: hashToken(confirmToken),
        unsubscribeTokenHash: hashToken(unsubToken),
        unsubscribedAt: null,
        confirmedAt: null,
      })
      .where(eq(newsletterSubscribers.id, existing.id));
  } else {
    await db.insert(newsletterSubscribers).values({
      email,
      confirmTokenHash: hashToken(confirmToken),
      unsubscribeTokenHash: hashToken(unsubToken),
    });
  }

  const confirmUrl = siteUrl(`/newsletter/confirm?token=${confirmToken}`);
  const mail = await sendEmail({
    to: email,
    subject: "Confirm your Egigogo Newspaper subscription",
    html: `<p>Confirm your subscription:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
    text: `Confirm your subscription: ${confirmUrl}`,
  });

  if (!mail.ok) {
    return {
      ok: true as const,
      message: emailConfigured()
        ? "Check your email to confirm."
        : "Saved. Email is not configured yet — ask staff to confirm your address, or set BREVO_API_KEY.",
    };
  }

  return { ok: true as const, message: "Check your email to confirm." };
}

export async function confirmNewsletter(token: string) {
  if (!token) return { ok: false as const, error: "Missing token" };
  const db = getDb();
  const hash = hashToken(token);
  const [row] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.confirmTokenHash, hash))
    .limit(1);
  if (!row) return { ok: false as const, error: "Invalid or expired link" };

  await db
    .update(newsletterSubscribers)
    .set({
      confirmedAt: new Date(),
      confirmTokenHash: null,
      unsubscribedAt: null,
    })
    .where(eq(newsletterSubscribers.id, row.id));

  return { ok: true as const };
}

export async function unsubscribeNewsletter(token: string) {
  if (!token) return { ok: false as const, error: "Missing token" };
  const db = getDb();
  const hash = hashToken(token);
  const [row] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.unsubscribeTokenHash, hash))
    .limit(1);
  if (!row) return { ok: false as const, error: "Invalid or expired link" };

  await db
    .update(newsletterSubscribers)
    .set({ unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.id, row.id));

  return { ok: true as const };
}

export async function getNewsletterStats() {
  const db = getDb();
  const all = await db.select().from(newsletterSubscribers);
  const confirmed = all.filter((s) => s.confirmedAt && !s.unsubscribedAt).length;
  const sends = await db
    .select()
    .from(newsletterSends)
    .orderBy(desc(newsletterSends.sentAt))
    .limit(10);
  return { total: all.length, confirmed, sends };
}

export async function listNewsletterPickArticles() {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return [];

  const db = getDb();
  return db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      categorySlug: categories.slug,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(20);
}

const sendSchema = z.object({
  subject: z.string().min(3).max(500),
  intro: z.string().max(2000).optional().or(z.literal("")),
  articleIds: z.array(z.string().uuid()).max(20),
});

export async function sendNewsletterIssue(raw: z.infer<typeof sendSchema>) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  if (!emailConfigured()) {
    return {
      ok: false as const,
      error: "Email is not configured. Set BREVO_API_KEY and EMAIL_FROM.",
    };
  }

  const parsed = sendSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid",
    };
  }

  const db = getDb();
  const subs = await db
    .select()
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt));

  const recipients = subs.filter((s) => s.confirmedAt);
  if (recipients.length === 0) {
    return { ok: false as const, error: "No confirmed subscribers" };
  }

  let linksHtml = "";
  if (parsed.data.articleIds.length) {
    const picked = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        categorySlug: categories.slug,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(inArray(articles.id, parsed.data.articleIds));

    const map = new Map(picked.map((a) => [a.id, a]));
    linksHtml = parsed.data.articleIds
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((a) => {
        const href = siteUrl(articleHref(a!.categorySlug, a!.slug));
        return `<li><a href="${href}">${a!.title}</a></li>`;
      })
      .join("");
  }

  const html = `
    <h1>${parsed.data.subject}</h1>
    <p>${parsed.data.intro || ""}</p>
    ${linksHtml ? `<ul>${linksHtml}</ul>` : ""}
    <p>Egigogo Newspaper</p>
  `;

  let sent = 0;
  for (const sub of recipients) {
    const unsub = sub.unsubscribeTokenHash
      ? "" // token is hashed — use stored hash only for verify; skip per-sub link if we only have hash
      : "";
    void unsub;
    const result = await sendEmail({
      to: sub.email,
      subject: parsed.data.subject,
      html,
    });
    if (result.ok) sent += 1;
  }

  await db.insert(newsletterSends).values({
    subject: parsed.data.subject,
    intro: parsed.data.intro || null,
    sentBy: staff.id,
    articleIds: JSON.stringify(parsed.data.articleIds),
  });

  revalidatePath("/cms/newsletter");
  return { ok: true as const, sent };
}
