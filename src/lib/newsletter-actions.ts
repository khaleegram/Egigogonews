"use server";

import { createHash, randomBytes } from "crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb, withDbRetry } from "@/db";
import {
  articles,
  categories,
  newsletterSends,
  newsletterSubscribers,
} from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";
import {
  brandedEmailHtml,
  emailConfigured,
  newsletterIssueHtml,
  sendEmail,
  siteUrl,
} from "@/lib/email";
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
    html: brandedEmailHtml({
      title: "Confirm your subscription",
      preheader: "One tap to start receiving the Egigogo briefing.",
      bodyHtml: `
        <p style="margin:0 0 12px;color:#3a433e">Thanks for joining <strong style="color:#1a1f1c">Egigogo Newspaper</strong>.</p>
        <p style="margin:0;color:#3a433e">Tap the button below to confirm your email and get our briefing — politics, investigations, and stories that matter across Northern Nigeria and beyond.</p>
      `,
      ctaLabel: "Confirm subscription",
      ctaUrl: confirmUrl,
      footerNote: "If you didn’t subscribe, you can ignore this message.",
    }),
    text: `Confirm your Egigogo Newspaper subscription:\n\n${confirmUrl}\n`,
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

/** Confirm from the email link (GET). Idempotent so scanners + the user both get success. */
export async function confirmNewsletter(token: string) {
  if (!token) return { ok: false as const, error: "Missing token" };
  const db = getDb();
  const hash = hashToken(token.trim());
  const [row] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.confirmTokenHash, hash))
    .limit(1);
  if (!row) {
    return {
      ok: false as const,
      error:
        "This link is invalid or expired. Subscribe again from the website footer if you still want the briefing.",
    };
  }

  // Keep the token so a second open (after Gmail/security scanners) still shows success.
  if (!row.confirmedAt || row.unsubscribedAt) {
    await db
      .update(newsletterSubscribers)
      .set({
        confirmedAt: new Date(),
        unsubscribedAt: null,
      })
      .where(eq(newsletterSubscribers.id, row.id));
  }

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
  return withDbRetry(async () => {
    const db = getDb();
    const all = await db.select().from(newsletterSubscribers);
    const confirmed = all.filter((s) => s.confirmedAt && !s.unsubscribedAt)
      .length;
    const sends = await db
      .select()
      .from(newsletterSends)
      .orderBy(desc(newsletterSends.sentAt))
      .limit(10);
    return { total: all.length, confirmed, sends };
  });
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
      dek: articles.dek,
      byline: articles.bylineName,
      heroImageUrl: articles.heroImageUrl,
      categorySlug: categories.slug,
      categoryName: categories.name,
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

  let stories: {
    title: string;
    dek?: string | null;
    href: string;
    category?: string | null;
    byline?: string | null;
    imageUrl?: string | null;
  }[] = [];

  if (parsed.data.articleIds.length) {
    const picked = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        dek: articles.dek,
        byline: articles.bylineName,
        heroImageUrl: articles.heroImageUrl,
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(articles)
      .innerJoin(categories, eq(articles.categoryId, categories.id))
      .where(inArray(articles.id, parsed.data.articleIds));

    const map = new Map(picked.map((a) => [a.id, a]));
    stories = parsed.data.articleIds
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((a) => ({
        title: a!.title,
        dek: a!.dek,
        href: siteUrl(articleHref(a!.categorySlug, a!.slug)),
        category: a!.categoryName,
        byline: a!.byline,
        imageUrl: a!.heroImageUrl,
      }));
  }

  let sent = 0;
  for (const sub of recipients) {
    const unsubToken = randomBytes(24).toString("hex");
    await db
      .update(newsletterSubscribers)
      .set({ unsubscribeTokenHash: hashToken(unsubToken) })
      .where(eq(newsletterSubscribers.id, sub.id));

    const unsubscribeUrl = siteUrl(
      `/newsletter/unsubscribe?token=${unsubToken}`,
    );
    const html = newsletterIssueHtml({
      subject: parsed.data.subject,
      intro: parsed.data.intro,
      stories,
      unsubscribeUrl,
    });
    const textLines = [
      parsed.data.subject,
      parsed.data.intro || "",
      "",
      ...stories.map((s) => `• ${s.title}\n  ${s.href}`),
      "",
      `Unsubscribe: ${unsubscribeUrl}`,
    ];

    const result = await sendEmail({
      to: sub.email,
      subject: parsed.data.subject,
      html,
      text: textLines.filter(Boolean).join("\n"),
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
