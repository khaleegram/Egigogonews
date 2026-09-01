import { StoryCard } from "@/components/site/story-card";
import type { Story } from "@/lib/story";
import Link from "next/link";

export function StoryIndex({
  title,
  stories,
  empty = "No stories in this section yet.",
}: {
  title: string;
  stories: Story[];
  empty?: string;
}) {
  return (
    <div className="page-wrap">
      <h1 className="page-title">{title}</h1>
      {stories.length === 0 ? (
        <p className="empty-state">{empty}</p>
      ) : (
        <div className="story-grid">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
      <div className="pager">
        <span style={{ color: "var(--ink-muted)" }}>Page 1</span>
        <Link href="#">Next</Link>
      </div>
    </div>
  );
}
