"use client";

import { useState, useTransition } from "react";
import { submitComment } from "@/lib/comment-actions";

export function CommentBlock({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: {
    id: string;
    displayName: string;
    body: string;
    createdAt: Date | string;
  }[];
}) {
  const [pendingMsg, setPendingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading">Comments</h2>
      {initialComments.length === 0 ? (
        <p className="empty-state" style={{ padding: "0 0 1rem" }}>
          No comments yet.
        </p>
      ) : (
        <ul className="comment-list" style={{ listStyle: "none", padding: 0 }}>
          {initialComments.map((c) => (
            <li key={c.id} style={{ marginBottom: "1rem" }}>
              <strong>{c.displayName}</strong>
              <p style={{ margin: "0.25rem 0 0" }}>{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      {pendingMsg ? (
        <p className="form-success">Thanks. Your comment is awaiting review.</p>
      ) : (
        <form
          className="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            start(async () => {
              const result = await submitComment({
                articleId,
                displayName: String(fd.get("name") ?? ""),
                email: String(fd.get("email") ?? ""),
                body: String(fd.get("body") ?? ""),
                honeypot: String(fd.get("website") ?? ""),
              });
              if (!result.ok) setError(result.error);
              else setPendingMsg(true);
            });
          }}
        >
          <input name="name" required minLength={2} placeholder="Name" />
          <input name="email" type="email" required placeholder="Email" />
          <textarea name="body" required minLength={10} placeholder="Your comment" />
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
            aria-hidden
          />
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn" disabled={pending}>
            Post comment
          </button>
        </form>
      )}
    </section>
  );
}
