"use client";

import { useState, useTransition } from "react";
import { SEED_CATEGORIES } from "@/lib/constants";
import { submitTip } from "@/lib/tip-actions";

export default function TipsPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <div className="page-wrap prose-page">
        <h1 className="page-title">Thank you</h1>
        <p>Editors will review.</p>
        <button type="button" className="btn" onClick={() => setDone(false)}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrap prose-page">
      <h1 className="page-title">Send a news tip</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        Share what you know. We protect sources and verify before publishing.
      </p>
      <form
        className="tips-form"
        style={{ marginTop: "1.25rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const result = await submitTip({
              name: String(fd.get("name") ?? ""),
              contact: String(fd.get("contact") ?? ""),
              location: String(fd.get("location") ?? ""),
              categorySlug: String(fd.get("category") ?? ""),
              message: String(fd.get("message") ?? ""),
              honeypot: String(fd.get("website") ?? ""),
            });
            if (!result.ok) setError(result.error);
            else setDone(true);
          });
        }}
      >
        <label>
          Name (optional)
          <input name="name" />
        </label>
        <label>
          Contact (phone or email)
          <input name="contact" required />
        </label>
        <label>
          Location (optional)
          <input name="location" />
        </label>
        <label>
          Category (optional)
          <select name="category" defaultValue="">
            <option value="">—</option>
            {SEED_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Message
          <textarea name="message" required minLength={30} />
        </label>
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: "none" }}
          aria-hidden
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="btn" disabled={pending}>
          Submit tip
        </button>
      </form>
    </div>
  );
}
