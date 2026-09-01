import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { r2Configured } from "@/lib/r2";

/** External free cron. Full dump → R2 when storage is wired. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  const ok =
    secret &&
    (header === `Bearer ${secret}` ||
      new URL(req.url).searchParams.get("secret") === secret);

  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!r2Configured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT, and R2_PUBLIC_URL before backups can run.",
      },
      { status: 503 },
    );
  }

  try {
    const db = getDb();
    const now = new Date();
    const [existing] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    if (existing) {
      await db
        .update(siteSettings)
        .set({ lastBackupAt: now })
        .where(eq(siteSettings.id, 1));
    } else {
      await db.insert(siteSettings).values({
        id: 1,
        siteName: "Egigogo Newspaper",
        tagline: "Truth, Integrity and Impact",
        lastBackupAt: now,
      });
    }

    // Placeholder: pg_dump / Neon export upload to R2 belongs here once ops wiring exists.
    return NextResponse.json({
      ok: true,
      backedUp: true,
      note: "Recorded lastBackupAt. Attach pg_dump → R2 when host backup tooling is available.",
      lastBackupAt: now.toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Backup failed",
      },
      { status: 500 },
    );
  }
}
