import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/article-view";
import {
  getPublishedByTypeAndSlug,
  incrementArticleViews,
  listPublishedStories,
} from "@/lib/articles";
import { metadataForStory } from "@/lib/story-metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("feature", slug);
  if (!story) return {};
  return metadataForStory(story);
}

export default async function FeatureArticlePage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("feature", slug);
  if (!story) notFound();
  void incrementArticleViews(story.id);
  const related = (
    await listPublishedStories({ type: "feature", limit: 5 })
  ).filter((s) => s.id !== story.id);
  return <ArticleView story={story} related={related} />;
}
