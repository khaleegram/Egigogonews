"use client";

import Image from "next/image";
import { useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  kind: "image" | "audio";
  filename: string;
  alt: string | null;
  createdAt?: Date | string;
};

export function MediaGrid({
  items,
  onSelect,
}: {
  items: MediaItem[];
  onSelect?: (item: MediaItem) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="empty-state">No media uploaded yet.</p>;
  }

  return (
    <div className="media-grid">
      {items.map((item) => (
        <article key={item.id} className="media-grid__item">
          {item.kind === "image" ? (
            <button
              type="button"
              className="media-grid__thumb"
              onClick={() => {
                if (onSelect) onSelect(item);
                else {
                  void navigator.clipboard.writeText(item.url);
                  setCopied(item.id);
                  window.setTimeout(() => setCopied(null), 1500);
                }
              }}
            >
              <Image
                src={item.url}
                alt={item.alt || item.filename}
                fill
                sizes="180px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </button>
          ) : (
            <button
              type="button"
              className="media-grid__audio"
              onClick={() => {
                if (onSelect) onSelect(item);
                else {
                  void navigator.clipboard.writeText(item.url);
                  setCopied(item.id);
                  window.setTimeout(() => setCopied(null), 1500);
                }
              }}
            >
              Audio
              <span>{item.filename}</span>
            </button>
          )}
          <p className="media-grid__meta">
            {item.filename}
            {copied === item.id
              ? " · Copied"
              : onSelect
                ? " · Select"
                : " · Click to copy URL"}
          </p>
        </article>
      ))}
    </div>
  );
}
