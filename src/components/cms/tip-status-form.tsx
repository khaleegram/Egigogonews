"use client";

import { useState, useTransition } from "react";
import { updateTipStatus } from "@/lib/tip-actions";

export function TipStatusForm({
  id,
  initial,
}: {
  id: string;
  initial: "new" | "in_progress" | "closed";
}) {
  const [status, setStatus] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setOk(false);
        start(async () => {
          const result = await updateTipStatus(id, status);
          if (!result.ok) setError(result.error);
          else setOk(true);
        });
      }}
    >
      <label>
        Status
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "new" | "in_progress" | "closed")
          }
        >
          <option value="new">new</option>
          <option value="in_progress">in_progress</option>
          <option value="closed">closed</option>
        </select>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {ok ? <p className="form-success">Saved.</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        Save status
      </button>
    </form>
  );
}
