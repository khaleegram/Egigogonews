"use client";

import { useEffect, useState, useTransition } from "react";
import { MediaGrid, type MediaItem } from "@/components/cms/media-grid";
import { MediaUploadForm } from "@/components/cms/media-upload-form";
import { listMediaLibrary } from "@/lib/media-actions";

type Props = {
  open: boolean;
  kind?: "image" | "audio";
  title?: string;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
};

export function MediaPickerModal({
  open,
  kind = "image",
  title = "Choose from library",
  onClose,
  onPick,
}: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const rows = await listMediaLibrary({ kind, limit: 80 });
      setItems(rows);
    });
  }, [open, kind]);

  if (!open) return null;

  return (
    <div className="media-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="media-modal__panel">
        <header className="media-modal__head">
          <h2>{title}</h2>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <MediaUploadForm
          kind={kind}
          compact
          onUploaded={(item) => {
            const row: MediaItem = {
              id: item.id,
              url: item.url,
              kind: item.kind,
              filename: item.url.split("/").pop() ?? "file",
              alt: item.alt,
            };
            setItems((prev) => [row, ...prev]);
            onPick(row);
            onClose();
          }}
        />
        {pending && items.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <MediaGrid
            items={items}
            onSelect={(item) => {
              onPick(item);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
