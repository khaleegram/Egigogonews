"use server";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { auth } from "@/lib/auth";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/m4a"]);

const IMAGE_MAX = 8 * 1024 * 1024;
const AUDIO_MAX = 25 * 1024 * 1024;

export type MediaUploadResult =
  | { ok: true; id: string; url: string; kind: "image" | "audio"; alt: string | null }
  | { ok: false; error: string };

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (!role || !["admin", "editor", "reporter"].includes(role)) return null;
  return session.user.id;
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<MediaUploadResult> {
  const userId = await requireStaff();
  if (!userId) return { ok: false, error: "Sign in to upload media." };

  if (!r2Configured()) {
    return {
      ok: false,
      error:
        "Cloudflare R2 is not configured. Set R2_* keys in .env.local (see .env.example).",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const altRaw = String(formData.get("alt") ?? "").trim();
  const type = file.type;
  let kind: "image" | "audio";

  if (IMAGE_TYPES.has(type)) {
    kind = "image";
    if (file.size > IMAGE_MAX) {
      return { ok: false, error: "Images must be 8MB or smaller." };
    }
    if (!altRaw) {
      return { ok: false, error: "Alt text is required for images." };
    }
  } else if (AUDIO_TYPES.has(type) || /\.(mp3|m4a)$/i.test(file.name)) {
    kind = "audio";
    if (file.size > AUDIO_MAX) {
      return { ok: false, error: "Audio must be 25MB or smaller." };
    }
  } else {
    return {
      ok: false,
      error: "Allowed: JPEG, PNG, WebP (images) or MP3/M4A (audio).",
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = sanitizeFilename(file.name) || (kind === "image" ? "image.jpg" : "audio.mp3");
  const key = `media/${crypto.randomUUID()}-${safe}`;

  try {
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: type || (kind === "image" ? "image/jpeg" : "audio/mpeg"),
    });

    const db = getDb();
    const [row] = await db
      .insert(media)
      .values({
        url,
        kind,
        filename: file.name.slice(0, 500),
        alt: kind === "image" ? altRaw : null,
        uploadedBy: userId,
      })
      .returning();

    if (!row) return { ok: false, error: "Upload saved to R2 but DB insert failed." };
    return { ok: true, id: row.id, url: row.url, kind: row.kind, alt: row.alt };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    if (/media_uploaded_by_users_id_fk|foreign key/i.test(msg)) {
      return {
        ok: false,
        error:
          "Your session is out of date (user not in this database). Sign out, sign back in, then upload again.",
      };
    }
    return { ok: false, error: msg };
  }
}

export async function listMediaLibrary(opts?: {
  kind?: "image" | "audio";
  limit?: number;
}) {
  const db = getDb();
  const rows = await db
    .select({
      id: media.id,
      url: media.url,
      kind: media.kind,
      filename: media.filename,
      alt: media.alt,
      createdAt: media.createdAt,
    })
    .from(media)
    .where(opts?.kind ? eq(media.kind, opts.kind) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(opts?.limit ?? 100);

  return rows;
}
