"use client";

import { useState, useTransition } from "react";
import { sendNewsletterIssue } from "@/lib/newsletter-actions";

export function NewsletterComposeForm({
  articles,
  confirmedCount,
  emailReady,
}: {
  articles: { id: string; title: string }[];
  confirmedCount: number;
  emailReady: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggle(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  return (
    <form
      className="cms-newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`Send to ${confirmedCount} confirmed subscribers?`)) return;
        setError(null);
        setOk(null);
        start(async () => {
          const result = await sendNewsletterIssue({
            subject,
            intro,
            articleIds: selected,
          });
          if (!result.ok) setError(result.error ?? "Send failed");
          else setOk(`Sent to ${result.sent ?? 0} subscribers.`);
        });
      }}
    >
      {!emailReady ? (
        <div className="cms-callout cms-callout--warn" role="status">
          <strong>Email not configured yet.</strong>
          <span>
            Add <code>BREVO_API_KEY</code> and <code>EMAIL_FROM</code> when
            you are ready to send.
            you are ready to send. You can still draft and pick stories now.
          </span>
        </div>
      ) : null}

      <label className="cms-field">
        <span>Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="Morning briefing — Egigogo"
        />
      </label>

      <label className="cms-field">
        <span>Intro</span>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={4}
          placeholder="Short note that opens the email…"
        />
      </label>

      <fieldset className="cms-newsletter__picks">
        <legend>Articles (last 20 published)</legend>
        {articles.length === 0 ? (
          <p className="cms-newsletter__empty">No published articles yet.</p>
        ) : (
          <ul className="cms-newsletter__list">
            {articles.map((a) => (
              <li key={a.id}>
                <label className="cms-newsletter__item">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onChange={(e) => toggle(a.id, e.target.checked)}
                  />
                  <span>{a.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {selected.length > 0 ? (
          <p className="cms-newsletter__picked">{selected.length} selected</p>
        ) : null}
      </fieldset>

      {error ? <p className="form-error">{error}</p> : null}
      {ok ? <p className="form-success">{ok}</p> : null}

      <div className="cms-newsletter__actions">
        <button
          type="submit"
          className="btn"
          disabled={pending || !emailReady || confirmedCount === 0}
        >
          {pending ? "Sending…" : "Send newsletter"}
        </button>
        {!emailReady ? (
          <span className="cms-newsletter__hint">Waiting on Brevo keys</span>
        ) : confirmedCount === 0 ? (
          <span className="cms-newsletter__hint">No confirmed subscribers yet</span>
        ) : null}
      </div>
    </form>
  );
}
