"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { articles, categories } from "@/db/schema";
import { RESERVED_PATH_SEGMENTS } from "@/lib/constants";
import { isStaff, requireStaff } from "@/lib/cms-auth";
import { publicActionError } from "@/lib/public-error";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

const createSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(150),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional().or(z.literal("")),
  sortOrder: z.number().int(),
  active: z.boolean(),
});

export async function listCategoriesAdmin() {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return [];
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function createCategory(raw: z.infer<typeof createSchema>) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (RESERVED_PATH_SEGMENTS.has(slug)) {
    return {
      ok: false as const,
      error: `Slug "${slug}" is reserved by the site`,
    };
  }

  const db = getDb();
  try {
    await db.insert(categories).values({
      name: parsed.data.name.trim(),
      slug,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder ?? 99,
      active: true,
    });
  } catch (err) {
    console.error("[createCategory]", err);
    return {
      ok: false as const,
      error: publicActionError(err, "Could not create category."),
    };
  }

  revalidatePath("/cms/categories");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateCategory(raw: z.infer<typeof updateSchema>) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (RESERVED_PATH_SEGMENTS.has(parsed.data.slug)) {
    return {
      ok: false as const,
      error: `Slug "${parsed.data.slug}" is reserved by the site`,
    };
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, parsed.data.id))
    .limit(1);
  if (!existing) return { ok: false as const, error: "Category not found" };

  if (existing.slug !== parsed.data.slug) {
    const [published] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(
        and(
          eq(articles.categoryId, existing.id),
          eq(articles.status, "published"),
        ),
      )
      .limit(1);
    if (published) {
      return {
        ok: false as const,
        error: "Cannot change slug while published articles use this category",
      };
    }
  }

  try {
    await db
      .update(categories)
      .set({
        name: parsed.data.name.trim(),
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      })
      .where(eq(categories.id, parsed.data.id));
  } catch (err) {
    console.error("[updateCategory]", err);
    return {
      ok: false as const,
      error: publicActionError(err, "Could not update category."),
    };
  }

  revalidatePath("/cms/categories");
  revalidatePath("/");
  return { ok: true as const };
}

export async function toggleCategoryActive(id: string, active: boolean) {
  const staff = await requireStaff(["admin"]);
  if (!isStaff(staff)) return { ok: false as const, error: staff.error };

  const db = getDb();
  await db.update(categories).set({ active }).where(eq(categories.id, id));
  revalidatePath("/cms/categories");
  revalidatePath("/");
  return { ok: true as const };
}
