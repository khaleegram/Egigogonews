"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { breaking } from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";
import { pushConfigured, sendPushToAll } from "@/lib/push";

const saveSchema = z.object({
  headline: z.string().max(500),
  url: z.string().max(2000),
  active: z.boolean(),
});

export type BreakingActionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

async function ensureBreakingRow() {
  const db = getDb();
  const [row] = await db.select().from(breaking).where(eq(breaking.id, 1)).limit(1);
  if (!row) {
    await db.insert(breaking).values({
      id: 1,
      headline: "",
      url: "",
      active: false,
    });
  }
}

export async function getBreaking() {
  const db = getDb();
  await ensureBreakingRow();
  const [row] = await db.select().from(breaking).where(eq(breaking.id, 1)).limit(1);
  return row ?? null;
}

export async function saveBreaking(raw: {
  headline: string;
  url: string;
  active: boolean;
}): Promise<BreakingActionResult> {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return { ok: false, error: staff.error };

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.active && !parsed.data.headline.trim()) {
    return { ok: false, error: "Headline is required when breaking is active" };
  }

  const db = getDb();
  await ensureBreakingRow();
  const [prev] = await db.select().from(breaking).where(eq(breaking.id, 1)).limit(1);

  await db
    .update(breaking)
    .set({
      headline: parsed.data.headline.trim(),
      url: parsed.data.url.trim(),
      active: parsed.data.active,
      updatedBy: staff.id,
      updatedAt: new Date(),
    })
    .where(eq(breaking.id, 1));

  let warning: string | undefined;
  const turningOn = parsed.data.active && !prev?.active;
  if (turningOn) {
    const push = await sendPushToAll({
      title: "Breaking",
      body: parsed.data.headline.trim(),
      url: parsed.data.url.trim() || "/",
    });
    if (!push.ok) {
      warning = pushConfigured()
        ? push.error
        : "Breaking saved. Web Push is not configured — set VAPID keys to notify readers.";
    }
  }

  revalidatePath("/");
  revalidatePath("/cms/breaking");
  return warning ? { ok: true, warning } : { ok: true };
}

export async function clearBreaking(): Promise<BreakingActionResult> {
  const staff = await requireStaff(["admin", "editor"]);
  if (!isStaff(staff)) return { ok: false, error: staff.error };

  const db = getDb();
  await ensureBreakingRow();
  await db
    .update(breaking)
    .set({
      active: false,
      updatedBy: staff.id,
      updatedAt: new Date(),
    })
    .where(eq(breaking.id, 1));

  revalidatePath("/");
  revalidatePath("/cms/breaking");
  return { ok: true };
}
