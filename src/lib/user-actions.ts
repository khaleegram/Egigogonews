"use server";

import { hash } from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { isStaff, requireStaff } from "@/lib/cms-auth";

const createSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  role: z.enum(["admin", "editor", "reporter"]),
  password: z.string().min(8).max(200),
});

export async function listUsers() {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return [];

  const db = getDb();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

export async function createUser(raw: z.infer<typeof createSchema>) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const db = getDb();
  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return { ok: false as const, error: "Email already in use" };

  const passwordHash = await hash(parsed.data.password, 12);
  await db.insert(users).values({
    email,
    name: parsed.data.name.trim(),
    role: parsed.data.role,
    passwordHash,
    active: true,
  });

  revalidatePath("/cms/users");
  return { ok: true as const };
}

export async function setUserActive(id: string, active: boolean) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };
  if (id === staff.id && !active) {
    return { ok: false as const, error: "You cannot disable your own account" };
  }

  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) return { ok: false as const, error: "User not found" };

  await db.update(users).set({ active }).where(eq(users.id, id));
  revalidatePath("/cms/users");
  return { ok: true as const };
}

export async function setUserRole(
  id: string,
  role: "admin" | "editor" | "reporter",
) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) return { ok: false as const, error: "User not found" };

  if (row.role === "admin" && role !== "admin") {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(eq(users.role, "admin"), eq(users.active, true), ne(users.id, id)),
      );
    if (admins.length === 0) {
      return {
        ok: false as const,
        error: "Cannot demote the last active admin",
      };
    }
  }

  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/cms/users");
  return { ok: true as const };
}
