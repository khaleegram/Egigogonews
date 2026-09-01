"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/lib/newsletter-actions";

export function NewsletterForm({ id = "footer-email" }: { id?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (message) {
    return <p className="form-success">{message}</p>;
  }

  return (
    <form
      className="newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const result = await subscribeNewsletter(
            String(fd.get("email") ?? ""),
            String(fd.get("company") ?? ""),
          );
          if (!result.ok) setError(result.error);
          else setMessage(result.message);
        });
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        placeholder="your@email.com"
      />
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
        aria-hidden
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" disabled={pending}>
        Subscribe
      </button>
    </form>
  );
}
