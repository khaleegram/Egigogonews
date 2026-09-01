"use client";

import { useState } from "react";
import { MediaGrid, type MediaItem } from "@/components/cms/media-grid";
import { MediaUploadForm } from "@/components/cms/media-upload-form";

export function MediaLibraryClient({
  initialItems,
}: {
  initialItems: MediaItem[];
}) {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="media-library">
      <MediaUploadForm
        onUploaded={(item) => {
          setItems((prev) => [
            {
              id: item.id,
              url: item.url,
              kind: item.kind,
              filename: item.url.split("/").pop() ?? "file",
              alt: item.alt,
            },
            ...prev,
          ]);
        }}
      />
      <MediaGrid items={items} />
    </div>
  );
}
