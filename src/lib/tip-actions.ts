"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, notifications, tips, users } from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";

const submitSchema = z.object({
  name: z.string().max(255).optional().or(z.literal("")),
  contact: z.string().min(3).max(255),
  location: z.string().max(255).optional().or(z.literal("")),
  categorySlug: z.string().optional().or(z.literal("")),
  message: z.string().min(30).max(10000),
  imageUrl: z.string().max(2000).optional().or(z.literal("")),
});

export async function submitTip(raw: {
  name?: string;
  contact: string;
  location?: string;
  categorySlug?: string;
  message: string;
  imageUrl?: string;
  honeypot?: string;
}) {
  if (raw.honeypot) {
    return { ok: true as const, message: "Thank you. Editors will review." };
  }

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid tip",
    };
  }

  const db = getDb();
  let categoryId: string | null = null;
  if (parsed.data.categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, parsed.data.categorySlug))
      .limit(1);
    categoryId = cat?.id ?? null;
  }

  const [created] = await db
    .insert(tips)
    .values({
      name: parsed.data.name || null,
      contact: parsed.data.contact.trim(),
      location: parsed.data.location || null,
      categoryId,
      message: parsed.data.message.trim(),
      imageUrl: parsed.data.imageUrl || null,
      status: "new",
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
        kind: "tip" as const,
        title: `New tip from ${parsed.data.contact.trim()}`,
        link: `/cms/tips/${created.id}`,
      })),
    );
  }

  revalidatePath("/cms/tips");
  return { ok: true as const, message: "Thank you. Editors will review." };
}

export async function listTips(status?: "new" | "in_progress" | "closed") {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return [];

  const db = getDb();
  if (status) {
    return db
      .select()
      .from(tips)
      .where(eq(tips.status, status))
      .orderBy(desc(tips.createdAt));
  }
  return db.select().from(tips).orderBy(desc(tips.createdAt));
}

export async function getTip(id: string) {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return null;
  const db = getDb();
  const [row] = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
  return row ?? null;
}

export async function updateTipStatus(
  id: string,
  status: "new" | "in_progress" | "closed",
) {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const db = getDb();
  const [row] = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
  if (!row) return { ok: false as const, error: "Tip not found" };

  await db
    .update(tips)
    .set({ status, updatedAt: new Date() })
    .where(eq(tips.id, id));

  revalidatePath("/cms/tips");
  revalidatePath(`/cms/tips/${id}`);
  return { ok: true as const };
}
