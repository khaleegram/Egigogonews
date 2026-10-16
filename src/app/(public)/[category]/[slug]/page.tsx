import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/article-view";
import {
  getPublishedBySlug,
  listPublishedArticleParams,
  listPublishedStories,
} from "@/lib/articles";
import { RESERVED_PATH_SEGMENTS } from "@/lib/constants";
import { metadataForStory } from "@/lib/story-metadata";

type Props = { params: Promise<{ category: string; slug: string }> };

// On-demand only: traffic must not regenerate pages (crawlers were waking the
// DB); CMS/publish writes call revalidatePath() so content still updates instantly.
export const revalidate = false;

/** Required for ISR — without this every article view queries the DB. */
export async function generateStaticParams() {
  const rows = await listPublishedArticleParams();
  return rows.map((r) => ({ category: r.category, slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (RESERVED_PATH_SEGMENTS.has(category)) return {};
  const story = await getPublishedBySlug(category, slug);
  if (!story) return {};
  return metadataForStory(story);
}

export default async function NewsArticlePage({ params }: Props) {
  const { category, slug } = await params;
  if (RESERVED_PATH_SEGMENTS.has(category)) notFound();

  const story = await getPublishedBySlug(category, slug);
  if (!story) notFound();

  const related = (
    await listPublishedStories({
      categorySlug: story.categorySlug,
      limit: 5,
    })
  ).filter((s) => s.id !== story.id);

  return <ArticleView story={story} related={related} />;
}
