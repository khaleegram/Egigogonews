"use client";

import { useState, useTransition } from "react";
import { saveAdSlot } from "@/lib/ad-actions";
import { AD_SLOT_KEYS } from "@/lib/constants";

type SlotKey = (typeof AD_SLOT_KEYS)[number];

export function AdSlotForm({
  slot,
}: {
  slot: {
    slotKey: SlotKey;
    imageUrl: string | null;
    clickUrl: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    active: boolean;
  };
}) {
  const [imageUrl, setImageUrl] = useState(slot.imageUrl ?? "");
  const [clickUrl, setClickUrl] = useState(slot.clickUrl ?? "");
  const [startsAt, setStartsAt] = useState(
    slot.startsAt ? slot.startsAt.toISOString().slice(0, 16) : "",
  );
  const [endsAt, setEndsAt] = useState(
    slot.endsAt ? slot.endsAt.toISOString().slice(0, 16) : "",
  );
  const [active, setActive] = useState(slot.active);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="auth-form"
      style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--line)" }}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setOk(false);
        start(async () => {
          const result = await saveAdSlot({
            slotKey: slot.slotKey,
            imageUrl,
            clickUrl,
            startsAt,
            endsAt,
            active,
          });
          if (!result.ok) setError(result.error);
          else setOk(true);
        });
      }}
    >
      <h2 style={{ fontFamily: "var(--font-display), Georgia, serif" }}>{slot.slotKey}</h2>
      <label>
        Image URL
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </label>
      <label>
        Click URL
        <input value={clickUrl} onChange={(e) => setClickUrl(e.target.value)} />
      </label>
      <label>
        Starts
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </label>
      <label>
        Ends
        <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
      </label>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {ok ? <p className="form-success">Saved.</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        Save slot
      </button>
    </form>
  );
}
