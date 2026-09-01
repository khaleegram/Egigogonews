"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { adSlots } from "@/db/schema";
import { AD_SLOT_KEYS } from "@/lib/constants";
import { isStaff, requireStaff } from "@/lib/cms-auth";

const saveSchema = z.object({
  slotKey: z.enum(AD_SLOT_KEYS),
  imageUrl: z.string().max(2000).optional().or(z.literal("")),
  clickUrl: z.string().max(2000).optional().or(z.literal("")),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  active: z.boolean(),
});

export async function listAdSlots() {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return [];

  const db = getDb();
  const rows = await db.select().from(adSlots);
  const byKey = new Map(rows.map((r) => [r.slotKey, r]));

  for (const key of AD_SLOT_KEYS) {
    if (!byKey.has(key)) {
      const [created] = await db
        .insert(adSlots)
        .values({ slotKey: key, active: false })
        .returning();
      if (created) byKey.set(key, created);
    }
  }

  return AD_SLOT_KEYS.map((key) => byKey.get(key)!).filter(Boolean);
}

export async function saveAdSlot(raw: z.infer<typeof saveSchema>) {
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
    .select()
    .from(adSlots)
    .where(eq(adSlots.slotKey, parsed.data.slotKey))
    .limit(1);

  const values = {
    imageUrl: parsed.data.imageUrl || null,
    clickUrl: parsed.data.clickUrl || null,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    active: parsed.data.active,
  };

  if (existing) {
    await db.update(adSlots).set(values).where(eq(adSlots.id, existing.id));
  } else {
    await db.insert(adSlots).values({
      slotKey: parsed.data.slotKey,
      ...values,
    });
  }

  revalidatePath("/");
  revalidatePath("/cms/ads");
  return { ok: true as const };
}
