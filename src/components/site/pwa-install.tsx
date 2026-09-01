"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "egigogo-pwa-install-dismissed";

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    setIsIos(ios);
    setStandalone(isStandalone);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (standalone || dismissed) return null;
  if (!deferred && !isIos) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") {
      setDismissed(true);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="pwa-install" role="region" aria-label="Install app">
      <div className="pwa-install__copy">
        <strong>Install Egigogo</strong>
        <p>
          {isIos && !deferred
            ? "Share → Add to Home Screen for the full app experience."
            : "Add to your home screen for faster access and breaking alerts."}
        </p>
      </div>
      <div className="pwa-install__actions">
        {deferred ? (
          <button type="button" className="btn" onClick={install}>
            Install
          </button>
        ) : null}
        <button type="button" className="btn btn--ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
