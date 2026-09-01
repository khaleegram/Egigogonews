"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";
import { emailConfigured } from "@/lib/email";
import { pushConfigured } from "@/lib/push";
import { r2Configured } from "@/lib/r2";

const saveSchema = z.object({
  siteName: z.string().min(2).max(255),
  tagline: z.string().min(2).max(255),
  whatsappChannelUrl: z.string().max(2000).optional().or(z.literal("")),
  facebookUrl: z.string().max(2000).optional().or(z.literal("")),
  twitterUrl: z.string().max(2000).optional().or(z.literal("")),
  instagramUrl: z.string().max(2000).optional().or(z.literal("")),
  youtubeUrl: z.string().max(2000).optional().or(z.literal("")),
  contactEmail: z.string().max(255).optional().or(z.literal("")),
  aboutHtml: z.string().max(100000).optional().or(z.literal("")),
});

export async function getSiteSettings() {
  const db = getDb();
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  return {
    settings: row ?? null,
    configured: {
      email: emailConfigured(),
      r2: r2Configured(),
      push: pushConfigured(),
    },
  };
}

export async function saveSiteSettings(raw: z.infer<typeof saveSchema>) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  const values = {
    siteName: parsed.data.siteName.trim(),
    tagline: parsed.data.tagline.trim(),
    whatsappChannelUrl: parsed.data.whatsappChannelUrl || null,
    facebookUrl: parsed.data.facebookUrl || null,
    twitterUrl: parsed.data.twitterUrl || null,
    instagramUrl: parsed.data.instagramUrl || null,
    youtubeUrl: parsed.data.youtubeUrl || null,
    contactEmail: parsed.data.contactEmail || null,
    aboutHtml: parsed.data.aboutHtml || null,
  };

  if (existing) {
    await db.update(siteSettings).set(values).where(eq(siteSettings.id, 1));
  } else {
    await db.insert(siteSettings).values({ id: 1, ...values });
  }

  revalidatePath("/cms/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");

  return {
    ok: true as const,
    configured: {
      email: emailConfigured(),
      r2: r2Configured(),
      push: pushConfigured(),
    },
  };
}
