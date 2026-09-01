"use client";

import { useState, useTransition } from "react";
import { clearBreaking, saveBreaking } from "@/lib/breaking-actions";

export function BreakingForm({
  initial,
}: {
  initial: { headline: string; url: string; active: boolean };
}) {
  const [headline, setHeadline] = useState(initial.headline);
  const [url, setUrl] = useState(initial.url);
  const [active, setActive] = useState(initial.active);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setWarning(null);
        setOk(false);
        start(async () => {
          const result = await saveBreaking({ headline, url, active });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          if (result.warning) setWarning(result.warning);
          setOk(true);
        });
      }}
    >
      <label>
        Headline
        <input value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </label>
      <label>
        URL
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {warning ? <p className="form-error">{warning}</p> : null}
      {ok ? <p className="form-success">Saved.</p> : null}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn" disabled={pending}>
          Save
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const result = await clearBreaking();
              if (!result.ok) setError(result.error);
              else {
                setActive(false);
                setOk(true);
              }
            })
          }
        >
          Clear / deactivate
        </button>
      </div>
    </form>
  );
}
