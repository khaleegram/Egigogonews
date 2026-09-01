"use client";

import { useState } from "react";

export function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  function share(kind: "wa" | "fb" | "x") {
    const u = encodeURIComponent(window.location.href);
    const t = encodeURIComponent(title);
    const href =
      kind === "wa"
        ? `https://wa.me/?text=${t}%20${u}`
        : kind === "fb"
          ? `https://www.facebook.com/sharer/sharer.php?u=${u}`
          : `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-row">
      <button type="button" onClick={() => share("wa")}>
        WhatsApp
      </button>
      <button type="button" onClick={() => share("fb")}>
        Facebook
      </button>
      <button type="button" onClick={() => share("x")}>
        X
      </button>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(window.location.href || url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
