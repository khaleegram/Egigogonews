import type { Metadata } from "next";
import { StoryCard } from "@/components/site/story-card";
import { searchPublishedStories } from "@/lib/articles";

type Props = { searchParams: Promise<{ q?: string }> };

// Search renders per query and reads the database — keep crawlers out of it.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const stories = query ? await searchPublishedStories(query) : [];

  return (
    <div className="page-wrap">
      <h1 className="page-title">Search</h1>
      <form
        className="site-search"
        action="/search"
        method="get"
        style={{ padding: 0, marginBottom: "1.5rem", maxWidth: "100%" }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search stories"
          aria-label="Search stories"
        />
        <button type="submit">Search</button>
      </form>
      {!query ? (
        <p className="empty-state">Enter a query to search published stories.</p>
      ) : stories.length === 0 ? (
        <p className="empty-state">No stories matched.</p>
      ) : (
        <div className="story-grid">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
