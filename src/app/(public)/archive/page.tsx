import { StoryCard } from "@/components/site/story-card";
import { SEED_CATEGORIES } from "@/lib/constants";
import { listPublishedStories } from "@/lib/articles";

type Props = {
  searchParams: Promise<{ month?: string; category?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ArchivePage({ searchParams }: Props) {
  const { month = "", category = "" } = await searchParams;
  const stories = await listPublishedStories({
    categorySlug: category || undefined,
    limit: 60,
  });

  // Month filter applied clientlessly on publishedAt when present
  const filtered =
    month.length === 7
      ? stories.filter((s) => {
          if (!s.publishedAt) return false;
          const key = s.publishedAt.toISOString().slice(0, 7);
          return key === month;
        })
      : stories;

  return (
    <div className="page-wrap">
      <h1 className="page-title">Archive</h1>
      <form className="tips-form" method="get" style={{ marginBottom: "1.5rem" }}>
        <label>
          Month
          <input name="month" type="month" defaultValue={month} />
        </label>
        <label>
          Category
          <select name="category" defaultValue={category}>
            <option value="">All</option>
            {SEED_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn">
          Apply
        </button>
      </form>
      <div className="story-grid">
        {filtered.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </div>
    </div>
  );
}
