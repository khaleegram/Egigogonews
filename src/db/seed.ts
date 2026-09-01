import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import {
  adSlots,
  articles,
  breaking,
  categories,
  siteSettings,
  users,
} from "./schema";
import { AD_SLOT_KEYS, SEED_CATEGORIES } from "../lib/constants";
import { DEMO_STORIES } from "../lib/demo-content";

async function seed() {
  const db = getDb();
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required");
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let adminId = existing[0]?.id;
  if (!adminId) {
    const passwordHash = await hash(password, 12);
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: "Admin",
        role: "admin",
        active: true,
      })
      .returning();
    adminId = created!.id;
    console.log("Seeded admin:", email);
  } else {
    console.log("Admin already exists:", email);
  }

  for (const c of SEED_CATEGORIES) {
    const found = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, c.slug))
      .limit(1);
    if (found.length === 0) {
      await db.insert(categories).values({
        slug: c.slug,
        name: c.name,
        sortOrder: c.sortOrder,
        active: true,
      });
    }
  }
  console.log("Categories seeded");

  const br = await db.select().from(breaking).limit(1);
  if (br.length === 0) {
    await db.insert(breaking).values({
      id: 1,
      headline: "",
      url: "",
      active: false,
    });
  }

  for (const key of AD_SLOT_KEYS) {
    const found = await db
      .select({ id: adSlots.id })
      .from(adSlots)
      .where(eq(adSlots.slotKey, key))
      .limit(1);
    if (found.length === 0) {
      await db.insert(adSlots).values({
        slotKey: key,
        active: false,
      });
    }
  }

  const settings = await db.select().from(siteSettings).limit(1);
  if (settings.length === 0) {
    await db.insert(siteSettings).values({
      id: 1,
      siteName: "Egigogo Newspaper",
      tagline: "Truth, Integrity and Impact",
    });
  }

  const cats = await db.select().from(categories);
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const articleCount = await db.select({ id: articles.id }).from(articles).limit(1);

  if (articleCount.length === 0 && adminId) {
    const now = Date.now();
    for (let i = 0; i < DEMO_STORIES.length; i++) {
      const s = DEMO_STORIES[i]!;
      const categoryId = catBySlug.get(s.categorySlug);
      if (!categoryId) continue;
      const slug = s.href.split("/").pop()!;
      const bodyHtml = (s.body ?? [s.dek])
        .map((p) => `<p>${p}</p>`)
        .join("");
      await db.insert(articles).values({
        type: s.type ?? "news",
        status: "published",
        title: s.title,
        slug,
        dek: s.dek,
        body: bodyHtml,
        categoryId,
        authorId: adminId,
        bylineName: s.byline ?? "Egigogo Newspaper",
        heroImageUrl: s.imageUrl,
        heroImageAlt: s.imageAlt,
        videoEmbedUrl: s.hasVideo
          ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          : null,
        featured: i < 3,
        sponsored: false,
        publishedAt: new Date(now - i * 3600_000 * 6),
        viewCount: s.viewCount,
      });
    }
    console.log(`Seeded ${DEMO_STORIES.length} demo articles`);
  } else {
    console.log("Articles already present — skip demo seed");
  }

  console.log("Seed complete");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
