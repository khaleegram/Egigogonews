import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/article-view";
import {
  getPublishedByTypeAndSlug,
  listPublishedSlugsByType,
  listPublishedStories,
} from "@/lib/articles";
import { metadataForStory } from "@/lib/story-metadata";

type Props = { params: Promise<{ slug: string }> };

// On-demand only: traffic must not regenerate pages (crawlers were waking the
// DB); CMS/publish writes call revalidatePath() so content still updates instantly.
export const revalidate = false;

/** Required for ISR — without this every story view queries the DB. */
export async function generateStaticParams() {
  return listPublishedSlugsByType("opinion");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("opinion", slug);
  if (!story) return {};
  return metadataForStory(story);
}

export default async function OpinionArticlePage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("opinion", slug);
  if (!story) notFound();
  const related = (
    await listPublishedStories({ type: "opinion", limit: 5 })
  ).filter((s) => s.id !== story.id);
  return <ArticleView story={story} related={related} />;
}
