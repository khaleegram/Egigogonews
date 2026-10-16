"use client";

import { useMemo, useState } from "react";
import { StoryCard } from "@/components/site/story-card";
import { SEED_CATEGORIES } from "@/lib/constants";
import type { Story } from "@/lib/story";

/**
 * Archive filters live on the client so the archive route stays static and
 * cached — a server-rendered filter would query the database on every visit
 * (crawlers included) and wake the Neon compute.
 */
export function ArchiveBrowser({ stories }: { stories: Story[] }) {
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(
    () =>
      stories.filter((s) => {
        if (category && s.categorySlug !== category) return false;
        if (month.length === 7) {
          if (!s.publishedAt) return false;
          const key = new Date(s.publishedAt).toISOString().slice(0, 7);
          return key === month;
        }
        return true;
      }),
    [stories, month, category],
  );

  return (
    <>
      <form
        className="tips-form"
        style={{ marginBottom: "1.5rem" }}
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Month
          <input
            name="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </label>
        <label>
          Category
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All</option>
            {SEED_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </form>
      {filtered.length === 0 ? (
        <p className="empty-state">No stories match that filter yet.</p>
      ) : (
        <div className="story-grid">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </>
  );
}
