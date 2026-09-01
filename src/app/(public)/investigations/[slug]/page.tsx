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
  const story = await getPublishedByTypeAndSlug("investigative", slug);
  if (!story) return {};
  return metadataForStory(story);
}

export default async function InvestigationArticlePage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublishedByTypeAndSlug("investigative", slug);
  if (!story) notFound();
  void incrementArticleViews(story.id);
  const related = (
    await listPublishedStories({ type: "investigative", limit: 5 })
  ).filter((s) => s.id !== story.id);
  return <ArticleView story={story} related={related} />;
}
