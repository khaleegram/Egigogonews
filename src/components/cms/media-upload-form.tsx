"use client";

import { useRef, useState, useTransition } from "react";
import { uploadMediaAction } from "@/lib/media-actions";

type Props = {
  kind?: "image" | "audio" | "any";
  onUploaded?: (item: {
    id: string;
    url: string;
    kind: "image" | "audio";
    alt: string | null;
  }) => void;
  compact?: boolean;
};

export function MediaUploadForm({
  kind = "any",
  onUploaded,
  compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const accept =
    kind === "image"
      ? "image/jpeg,image/png,image/webp"
      : kind === "audio"
        ? "audio/mpeg,audio/mp4,.mp3,.m4a"
        : "image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,.mp3,.m4a";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file.");
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    fd.set("alt", alt);
    startTransition(async () => {
      const result = await uploadMediaAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError("");
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(result);
    });
  }

  return (
    <form className={compact ? "media-upload media-upload--compact" : "media-upload"} onSubmit={onSubmit}>
      <label>
        File
        <input ref={inputRef} type="file" accept={accept} required />
      </label>
      {kind !== "audio" ? (
        <label>
          Alt text {kind === "image" ? "(required for images)" : "(required if image)"}
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describe the image"
          />
        </label>
      ) : null}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
