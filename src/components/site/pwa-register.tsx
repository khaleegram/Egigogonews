"use client";

import { useEffect } from "react";

/** Registers the app service worker once on the public site. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development" && location.protocol !== "https:" && location.hostname !== "localhost") {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        reg.update().catch(() => {});
      } catch {
        /* SW registration can fail on insecure origins — ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
