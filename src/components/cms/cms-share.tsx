"use client";

import { useState } from "react";
import { siteUrl } from "@/lib/email";

export function CmsShare({
  title,
  categorySlug,
  articleSlug,
  status,
}: {
  title: string;
  categorySlug: string;
  articleSlug: string;
  status: string;
}) {
  const [copied, setCopied] = useState(false);

  const publicUrl = siteUrl(`/${categorySlug}/${articleSlug}`);
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(publicUrl);

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status !== "published") {
    return (
      <div className="cms-share cms-share--unpublished">
        <p className="cms-share__label">Share</p>
        <p className="cms-share__note">Publish the article first to share it.</p>
      </div>
    );
  }

  return (
    <div className="cms-share">
      <p className="cms-share__label">Share</p>
      <div className="cms-share__row">
        <button
          type="button"
          className="cms-share__btn"
          onClick={() =>
            open(`https://wa.me/?text=${t}%20${u}`)
          }
        >
          WhatsApp
        </button>
        <button
          type="button"
          className="cms-share__btn"
          onClick={() =>
            open(`https://www.facebook.com/sharer/sharer.php?u=${u}`)
          }
        >
          Facebook
        </button>
        <button
          type="button"
          className="cms-share__btn"
          onClick={() =>
            open(`https://twitter.com/intent/tweet?url=${u}&text=${t}`)
          }
        >
          X / Twitter
        </button>
        <button
          type="button"
          className="cms-share__btn"
          onClick={copyLink}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cms-share__btn"
        >
          View on site →
        </a>
      </div>
    </div>
  );
}
