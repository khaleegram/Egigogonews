import webpush from "web-push";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export function pushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  );
}

export type PushResult =
  | { ok: true; sent: number }
  | { ok: false; error: string };

function ensureVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:news@egigogo.ng",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

export async function sendPushToAll(payload: {
  title: string;
  body?: string;
  url?: string;
}): Promise<PushResult> {
  if (!pushConfigured()) {
    return {
      ok: false,
      error:
        "Web Push is not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and NEXT_PUBLIC_VAPID_PUBLIC_KEY.",
    };
  }

  ensureVapid();
  const db = getDb();
  const rows = await db.select().from(pushSubscriptions);
  let sent = 0;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        JSON.stringify(payload),
      );
      sent += 1;
    } catch (err) {
      const status =
        err && typeof err === "object" && "statusCode" in err
          ? Number((err as { statusCode: number }).statusCode)
          : 0;
      if (status === 404 || status === 410) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.id, row.id));
      }
    }
  }

  return { ok: true, sent };
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  if (!pushConfigured()) {
    return {
      ok: false as const,
      error: "Web Push is not configured on this server.",
    };
  }
  const db = getDb();
  await db
    .insert(pushSubscriptions)
    .values(input)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: input.p256dh, auth: input.auth },
    });
  return { ok: true as const };
}

export async function removePushSubscription(endpoint: string) {
  const db = getDb();
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
  return { ok: true as const };
}
