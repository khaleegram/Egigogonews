import { HomeHero } from "@/components/home/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { StoryCard } from "@/components/site/story-card";
import { SEED_CATEGORIES } from "@/lib/constants";
import {
  getFeaturedStories,
  listPublishedStories,
} from "@/lib/articles";
import type { Story } from "@/lib/story";

function toHero(s: Story) {
  return {
    id: s.id,
    href: s.href,
    category: s.category,
    title: s.title,
    dek: s.dek,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    publishedLabel: s.publishedLabel,
    viewCount: s.viewCount,
    byline: s.byline,
  };
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = (await getFeaturedStories(3)).map(toHero);
  const featuredIds = featured.map((s) => s.id);
  const latest = await listPublishedStories({
    limit: 4,
    excludeIds: featuredIds,
    orderBy: "latest",
  });
  const trending = await listPublishedStories({
    limit: 8,
    orderBy: "trending",
  });
  const opinion = await listPublishedStories({
    type: "opinion",
    limit: 3,
  });
  const features = await listPublishedStories({
    type: "feature",
    limit: 2,
  });
  const investigations = await listPublishedStories({
    type: "investigative",
    limit: 2,
  });

  const categoryRails = await Promise.all(
    SEED_CATEGORIES.slice(0, 6).map(async (cat) => ({
      cat,
      items: await listPublishedStories({
        categorySlug: cat.slug,
        limit: 3,
      }),
    })),
  );

  return (
    <>
      <HomeHero stories={featured} />

      <div className="page-wrap">
        <section className="home-block reveal" aria-labelledby="latest-heading">
          <SectionHeading title="Latest" href="/archive" />
          <div className="story-grid">
            {latest.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>

        {categoryRails.map(({ cat, items }) => {
          if (items.length === 0) return null;
          return (
            <section
              key={cat.slug}
              className="home-block reveal"
              aria-labelledby={`rail-${cat.slug}`}
            >
              <SectionHeading
                title={cat.name}
                href={`/category/${cat.slug}`}
              />
              <div className="rail-grid">
                {items.map((s) => (
                  <StoryCard key={s.id} story={s} variant="rail" />
                ))}
              </div>
            </section>
          );
        })}

        <section className="home-block reveal" aria-labelledby="opinion-heading">
          <SectionHeading title="Opinion" href="/opinion" />
          <div className="story-grid story-grid--3">
            {opinion.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>

        <div className="home-split reveal">
          <section className="home-block" aria-labelledby="features-heading">
            <SectionHeading title="Features" href="/features" />
            <div className="stack-gap">
              {features.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
          <section
            className="home-block"
            aria-labelledby="investigations-heading"
          >
            <SectionHeading title="Investigations" href="/investigations" />
            <div className="stack-gap">
              {investigations.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
        </div>

        <section className="home-block reveal" aria-labelledby="trending-heading">
          <SectionHeading title="Trending" seeAll={false} />
          <ol className="trending-list">
            {trending.map((s, i) => (
              <li key={s.id}>
                <span className="trending-list__num" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <StoryCard story={s} variant="compact" />
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
