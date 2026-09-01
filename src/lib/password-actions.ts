"use server";

import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import {
  brandedEmailHtml,
  emailConfigured,
  sendEmail,
  siteUrl,
} from "@/lib/email";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(emailRaw: string) {
  const generic = {
    ok: true as const,
    message: "If that account exists, we sent a link.",
  };

  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return generic;
  }

  try {
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.active, true)))
      .limit(1);

    if (!user) return generic;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    const resetUrl = siteUrl(`/reset-password?token=${token}`);
    const mail = await sendEmail({
      to: user.email,
      subject: "Reset your Egigogo CMS password",
      html: brandedEmailHtml({
        title: "Reset your password",
        bodyHtml:
          "<p>We received a request to reset your Egigogo CMS password. This link expires in one hour.</p>",
        ctaLabel: "Choose a new password",
        ctaUrl: resetUrl,
      }),
      text: `Reset your Egigogo CMS password (expires in 1 hour):\n\n${resetUrl}\n`,
    });

    if (!mail.ok && !emailConfigured()) {
      console.warn(
        "[password-reset] Email not configured. Set BREVO_API_KEY and EMAIL_FROM.",
        resetUrl,
      );
    }
  } catch (err) {
    console.error("[password-reset]", err);
  }

  return generic;
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
  confirm: z.string().min(8).max(200),
});

export async function resetPassword(raw: z.infer<typeof resetSchema>) {
  const parsed = resetSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  if (parsed.data.password !== parsed.data.confirm) {
    return { ok: false as const, error: "Passwords do not match" };
  }

  const db = getDb();
  const tokenHash = hashToken(parsed.data.token);
  const now = new Date();

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false as const, error: "Invalid or expired reset link" };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, row.id));

  return { ok: true as const };
}
