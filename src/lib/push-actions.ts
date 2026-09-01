"use server";

import {
  pushConfigured,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/push";

export async function subscribePushAction(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  if (!input.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
    return { ok: false as const, error: "Invalid subscription." };
  }
  return savePushSubscription({
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
  });
}

export async function unsubscribePushAction(endpoint: string) {
  if (!endpoint) return { ok: false as const, error: "Missing endpoint." };
  await removePushSubscription(endpoint);
  return { ok: true as const };
}

export async function pushStatusAction() {
  return { configured: pushConfigured() };
}
